from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanLineItem


class StockReport(APIView):
    def get(self, _, consignee_id):
        stock_report = self._get_value_given_to_consignee(consignee_id)
        reduced_stock_report = self._reduce_stock_report(stock_report)
        return Response(reduced_stock_report, status=status.HTTP_200_OK)

    def _get_value_given_to_consignee(self, consignee_id):
        line_items = DistributionPlanLineItem.objects.filter(distribution_plan_node__consignee_id=consignee_id)
        stock_report = []
        for line_item in line_items:
            stock_report.append(self._get_report_details_for_line_item(line_item))

        return stock_report

    @staticmethod
    def _compute_quantity_received(line_item):
        latest_run = line_item.latest_run()
        responses = latest_run.questions_and_responses()
        return responses.get('amountReceived', 0)

    def _get_report_details_for_line_item(self, line_item):
        purchase_order_item = line_item.item.purchase_order_item()
        if purchase_order_item:
            purchase_order_number = purchase_order_item.purchase_order.order_number
            quantity_received = self._compute_quantity_received(line_item)
            total_value_received = quantity_received * line_item.item.net_price
            quantity_dispensed = self._compute_quantity_dispensed(line_item)
            value_dispensed = quantity_dispensed * line_item.item.net_price

            return {
                'document_number': purchase_order_number,
                'total_value_received': total_value_received,
                'total_value_dispensed': value_dispensed,
                'balance': (total_value_received - value_dispensed),
                'items': [{'code': line_item.item.item.material_code,
                           'description': line_item.item.item.description,
                           'quantity_delivered': line_item.targeted_quantity,
                           'date_delivered': str(line_item.planned_distribution_date),
                           'quantity_confirmed': quantity_received,
                           'date_confirmed': str(self._get_date_received(line_item)),
                           'quantity_dispatched': quantity_dispensed,
                           'balance': quantity_received - quantity_dispensed}]
            }
        return {}

    @staticmethod
    def _get_date_received(line_item):
        latest_run = line_item.latest_run()
        responses = latest_run.questions_and_responses()
        return responses.get('dateOfReceipt', None)

    @staticmethod
    def _compute_quantity_dispensed(line_item):
        total_quantity_dispensed = 0
        for child_node in line_item.distribution_plan_node.children.all():
            child_line_item = child_node.distributionplanlineitem_set.all().first()
            latest_run = child_line_item.latest_run()
            responses = latest_run.questions_and_responses()
            total_quantity_dispensed = total_quantity_dispensed + responses.get('amountReceived', 0)
        return total_quantity_dispensed

    def _reduce_stock_report(self, stock_report):
        reduced_report = []
        for report_item in stock_report:
            matching_report_item = self._find_item_in_stock_report(reduced_report, report_item)
            if matching_report_item:
                self._update_report_item(matching_report_item, report_item)
            else:
                reduced_report.append(report_item)
        return reduced_report

    @staticmethod
    def _find_item_in_stock_report(reduced_report, report_item):
        for item in reduced_report:
            if item['document_number'] == report_item['document_number']:
                return item
        return None

    @staticmethod
    def _update_report_item(matching_report_item, report_item):
        matching_report_item['total_value_received'] = matching_report_item['total_value_received'] + report_item[
            'total_value_received']
        matching_report_item['total_value_dispensed'] = matching_report_item['total_value_dispensed'] + report_item[
            'total_value_dispensed']
        matching_report_item['balance'] = matching_report_item['total_value_received'] - matching_report_item[
            'total_value_dispensed']
        matching_report_item['items'].append(report_item['items'][0])



