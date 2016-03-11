import json
import datetime
import requests
import math
from celery.utils.log import get_task_logger
from django.conf import settings
from django.core.urlresolvers import reverse
from elasticsearch import Elasticsearch, helpers
from rest_framework.response import Response
from rest_framework.views import APIView
from eums.services.csv_export_service import generate_supply_efficiency_report
from eums.services.exporter.supply_efficiency_report_csv_exporter import SUPPLY_EFFICIENCY_REPORT_TYPES

HEADER = {"Content-Type": "application/json; charset=UTF-8"}
ES_SETTINGS = settings.ELASTIC_SEARCH
logger = get_task_logger(__name__)


class ExportSupplyEfficiencyReportViewSet(APIView):
    def post(self, request):
        host_name = request.build_absolute_uri(reverse('home'))
        es_query = request.data
        if not es_query:
            raise Exception("es query params from request cannot be empty")

        report_types_map = {
            'distribution_plan_id': SUPPLY_EFFICIENCY_REPORT_TYPES.delivery,
            'order_item.item.id': SUPPLY_EFFICIENCY_REPORT_TYPES.item,
            'programme.id': SUPPLY_EFFICIENCY_REPORT_TYPES.outcome,
            'order_item.order.order_number': SUPPLY_EFFICIENCY_REPORT_TYPES.po_waybill,
            'ip.id': SUPPLY_EFFICIENCY_REPORT_TYPES.ip,
            'location': SUPPLY_EFFICIENCY_REPORT_TYPES.location
        }

        results = self.__search_from_es_using_http_client(es_query)
        report_items = self.__parse_report(results)
        report_type = report_types_map[es_query.get('aggs', {}).get('deliveries', {}).get('terms', {}).get('field')]
        generate_supply_efficiency_report(request.user, host_name, report_items, report_type)
        # generate_item_feedback_report.delay(request.user, host_name, items_feedback)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)

    @staticmethod
    def __search_from_es(query):
        es = Elasticsearch([ES_SETTINGS.HOST])
        scan_results = helpers.scan(client=es, query=query, index=ES_SETTINGS.INDEX, doc_type=ES_SETTINGS.NODE_TYPE,
                                    scroll="10m", timeout="10m")
        for item in scan_results:
            print "+++>: ", item

    @staticmethod
    def __search_from_es_using_http_client(query):
        es_search_url = "%s%s/%s/%s" % (ES_SETTINGS.HOST, ES_SETTINGS.INDEX, ES_SETTINGS.NODE_TYPE,
                                        '_search?search_type=count')
        response = requests.post(es_search_url, data=json.dumps(query), headers=HEADER)
        print("Response from ES: %s, %s" % (response.status_code, response.json()))
        results = json.loads(response.text)
        return results

    @staticmethod
    def __parse_report(response):
        buckets = response.get('aggregations', {}).get('deliveries', {}).get('buckets')

        def __round_aggregate(x):
            if x:
                return int(math.floor(x))
            return 0

        def __format_and_update_delivery_date(value_identifier):
            original_delivery_date = value_identifier.get("delivery", {}).get("delivery_date")
            if original_delivery_date:
                formatted_date = datetime.datetime.strptime(original_delivery_date, "%Y-%m-%d").strftime("%d-%b-%Y")
                value_identifier.get("delivery", {}).update(delivery_date=formatted_date)
            return value_identifier

        def __format_and_update_order_type(value_identifier):
            original_order_type = value_identifier.get("order_item", {}).get("order", {}).get("order_type")
            if original_order_type:
                formatted_order_type = ("PO" if original_order_type == "purchase_order" else "WB")
                value_identifier.get("order_item", {}).get("order", {}).update(order_type=formatted_order_type)
            return value_identifier

        def __map_bucket(bucket):
            value_identifier = bucket.get('identifier', {}).get('hits', {}).get('hits', {})[0].get("_source")
            value_identifier = __format_and_update_delivery_date(value_identifier)
            value_identifier = __format_and_update_order_type(value_identifier)

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
