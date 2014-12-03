from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanLineItem


class StockReport(APIView):
    @staticmethod
    def get(_, consignee_id):
        stock_report = _build_stock_report(consignee_id)
        reduced_stock_report = _reduce_stock_report(stock_report)
        return Response(reduced_stock_report, status=status.HTTP_200_OK)


def aggregate_line_items_into_stock_report(stock_report, line_item):
    purchase_order_item = line_item.item.purchase_order_item()
    if purchase_order_item:
        stock_report.append(_get_report_details_for_line_item(line_item))
    return stock_report


def _build_stock_report(consignee_id):
    line_items = DistributionPlanLineItem.objects.filter(distribution_plan_node__consignee_id=consignee_id)
    return reduce(aggregate_line_items_into_stock_report, line_items, [])


def _get_report_details_for_line_item(line_item):
    purchase_order_item = line_item.item.purchase_order_item()
    purchase_order_number = purchase_order_item.purchase_order.order_number
    quantity_received = _compute_quantity_received(line_item)
    total_value_received = quantity_received * line_item.item.net_price
    quantity_dispensed = _compute_quantity_dispensed(line_item)
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
                   'date_confirmed': str(_get_date_received(line_item)),
                   'quantity_dispatched': quantity_dispensed,
                   'balance': quantity_received - quantity_dispensed}]
    }


def _get_responses(line_item):
    latest_run = line_item.latest_run()
    responses = latest_run.questions_and_responses()
    return responses


def _compute_quantity_received(line_item):
    responses = _get_responses(line_item)
    return responses.get('amountReceived', 0)


def _get_date_received(line_item):
    responses = _get_responses(line_item)
    return responses.get('dateOfReceipt', None)


def _compute_quantity_dispensed(line_item):
    total_quantity_dispensed = 0
    for child_node in line_item.distribution_plan_node.children.all():
        child_line_item = child_node.distributionplanlineitem_set.all().first()
        responses = _get_responses(child_line_item)
        total_quantity_dispensed = total_quantity_dispensed + responses.get('amountReceived', 0)
    return total_quantity_dispensed


def _reduce_stock_report(stock_report):
    reduced_report = []
    for report_item in stock_report:
        matching_report_item = _find_item_in_stock_report(reduced_report, report_item)
        if matching_report_item:
            _update_report_item(matching_report_item, report_item)
        else:
            reduced_report.append(report_item)
    return reduced_report


def _find_item_in_stock_report(reduced_report, report_item):
    for item in reduced_report:
        if item['document_number'] == report_item['document_number']:
            return item
    return None


def _update_report_item(matching_report_item, report_item):
    matching_report_item['total_value_received'] = matching_report_item['total_value_received'] + report_item[
        'total_value_received']
    matching_report_item['total_value_dispensed'] = matching_report_item['total_value_dispensed'] + report_item[
        'total_value_dispensed']
    matching_report_item['balance'] = matching_report_item['total_value_received'] - matching_report_item[
        'total_value_dispensed']
    matching_report_item['items'].append(report_item['items'][0])




    


