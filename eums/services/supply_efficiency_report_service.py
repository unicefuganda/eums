import datetime
import json
import math
import requests

from celery.utils.log import get_task_logger
from django.conf import settings
from requests.adapters import HTTPAdapter
from requests.packages.urllib3 import Retry

from eums.services.exporter.supply_efficiency_report_csv_exporter import SUPPLY_EFFICIENCY_REPORT_TYPES

HEADER = {"Content-Type": "application/json; charset=UTF-8"}
ES_SETTINGS = settings.ELASTIC_SEARCH
logger = get_task_logger(__name__)


class SupplyEfficiencyReportService(object):
    @staticmethod
    def es_service_url():
        return "%s%s/%s/%s" % (ES_SETTINGS.HOST, ES_SETTINGS.INDEX, ES_SETTINGS.NODE_TYPE, '_search?search_type=count')

    @staticmethod
    def search_reports(query):
        retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        with requests.Session() as rs:
            rs.mount('http://', HTTPAdapter(max_retries=retries))
            response = rs.post(SupplyEfficiencyReportService.es_service_url(), data=json.dumps(query), headers=HEADER)
            return SupplyEfficiencyReportService.__parse_reports(response.json())

    @staticmethod
    def search_reports_with_formatted_date(query):
        reports = SupplyEfficiencyReportService.search_reports(query)
        return SupplyEfficiencyReportService.__change_reports_date_format(reports)

    @staticmethod
    def parse_report_type(query):
        report_types_map = {
            'distribution_plan_id': SUPPLY_EFFICIENCY_REPORT_TYPES.delivery,
            'order_item.item.id': SUPPLY_EFFICIENCY_REPORT_TYPES.item,
            'programme.id': SUPPLY_EFFICIENCY_REPORT_TYPES.outcome,
            'order_item.order.order_number': SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill,
            'ip.id': SUPPLY_EFFICIENCY_REPORT_TYPES.ip,
            'location': SUPPLY_EFFICIENCY_REPORT_TYPES.location
        }
        return report_types_map[query.get('aggs', {}).get('deliveries', {}).get('terms', {}).get('field')]

    @staticmethod
    def __parse_reports(response):
        buckets = response.get('aggregations', {}).get('deliveries', {}).get('buckets')

        def __round_aggregate(x):
            if x:
                return int(math.floor(x))
            return 0

        def __format_and_update_order_type(value_identifier):
            original_order_type = value_identifier.get("order_item", {}).get("order", {}).get("order_type")
            if original_order_type:
                formatted_order_type = ("PO" if original_order_type == "purchase_order" else "WB")
                value_identifier.get("order_item", {}).get("order", {}).update(order_type=formatted_order_type)

        def __map_bucket(bucket):
            value_identifier = bucket.get('identifier', {}).get('hits', {}).get('hits', {})[0].get("_source")
            __format_and_update_order_type(value_identifier)

            stages = bucket.get('delivery_stages', {}).get('buckets')
            value_delivered_to_ip = stages.get('ip', {}).get('total_value_delivered', {}).get('value')
            value_received_by_ip = value_delivered_to_ip - stages.get('ip', {}).get('total_loss', {}).get('value')
            value_distributed_by_ip = stages.get('distributed_by_ip', {}).get('total_value_delivered', {}).get('value')
            value_delivered_to_end_users = stages.get('end_users', {}).get('total_value_delivered', {}).get('value')

            return {
                "identifier": value_identifier,
                "delivery_stages": {
                    "unicef": {
                        "total_value": __round_aggregate(value_delivered_to_ip)
                    },
                    "ip_receipt": {
                        "total_value_received": __round_aggregate(value_received_by_ip),
                        "confirmed": __round_aggregate((0 if value_delivered_to_ip == 0 else
                                                        value_received_by_ip / value_delivered_to_ip) * 100),
                        "average_delay": __round_aggregate(stages.get('ip', {}).get('average_delay', {}).get('value'))
                    },
                    "ip_distribution": {
                        "total_value_distributed": __round_aggregate(value_distributed_by_ip),
                        "balance": __round_aggregate(value_received_by_ip - value_distributed_by_ip)
                    },
                    "end_user": {
                        "total_value_received": __round_aggregate(value_delivered_to_end_users),
                        "confirmed": __round_aggregate((0 if value_delivered_to_ip == 0 else
                                                        value_delivered_to_end_users / value_delivered_to_ip) * 100),
                        "average_delay": __round_aggregate(
                                stages.get('end_users', {}).get('average_delay', {}).get('value'))
                    }
                }
            }

        return map(__map_bucket, buckets)

    @staticmethod
    def __change_reports_date_format(reports):

        def __format_and_update_delivery_date(report):
            original_delivery_date = report.get("identifier", {}).get("delivery", {}).get("delivery_date")
            if original_delivery_date:
                formatted_date = datetime.datetime.strptime(original_delivery_date, "%Y-%m-%d").strftime("%d-%b-%Y")
                report.get("identifier", {}).get("delivery", {}).update(delivery_date=formatted_date)
            return report

        return map(__format_and_update_delivery_date, reports)
