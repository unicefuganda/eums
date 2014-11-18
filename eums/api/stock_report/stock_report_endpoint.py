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

    def _get_report_details_for_line_item(self, line_item):
        sales_order_number = line_item.item.sales_order.order_number
        item_net_price = line_item.item.net_price
        total_value_received = item_net_price * line_item.targeted_quantity
        value_dispensed = self._compute_value_dispensed(item_net_price, line_item)
        balance = total_value_received - value_dispensed

        return {
            'document_number': sales_order_number,
            'total_value_received': total_value_received,
            'total_value_dispensed': value_dispensed,
            'balance': balance}

    def _compute_value_dispensed(self, item_net_price, line_item):
        value_dispensed = 0
        for child_node in line_item.distribution_plan_node.children.all():
            child_line_item = child_node.distributionplanlineitem_set.all().first()
            value_dispensed = value_dispensed + (child_line_item.targeted_quantity * item_net_price)
        return value_dispensed

    def _reduce_stock_report(self, stock_report):
        reduced_report = []
        for report_item in stock_report:
            matching_report_item = self._find_item_in_stock_report(reduced_report, report_item)
            if matching_report_item:
                self._update_report_item(matching_report_item, report_item)
            else:
                reduced_report.append(report_item)
        return reduced_report

    def _find_item_in_stock_report(self, reduced_report, report_item):
        for item in reduced_report:
            if item['document_number'] == report_item['document_number']:
                return item
        return None

    def _update_report_item(self, matching_report_item, report_item):
        matching_report_item['total_value_received'] = matching_report_item['total_value_received'] + report_item[
            'total_value_received']
        matching_report_item['total_value_dispensed'] = matching_report_item['total_value_dispensed'] + report_item[
            'total_value_dispensed']
        matching_report_item['balance'] = matching_report_item['total_value_received'] - matching_report_item[
            'total_value_dispensed']



