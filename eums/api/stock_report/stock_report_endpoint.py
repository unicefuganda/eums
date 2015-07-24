from eums.models import DistributionPlanNode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class StockReport(APIView):
    @staticmethod
    def get(_, consignee_id):
        stock_report = _build_stock_report(consignee_id)
        reduced_stock_report = _reduce_stock_report(stock_report)
        return Response(reduced_stock_report, status=status.HTTP_200_OK)


def aggregate_nodes_into_stock_report(stock_report, node):
    if node.item:
        stock_report.append(_get_report_details_for_node(node))
    return stock_report


def _build_stock_report(consignee_id):
    nodes = DistributionPlanNode.objects.filter(consignee_id=consignee_id)
    return reduce(aggregate_nodes_into_stock_report, nodes, [])


def _get_report_details_for_node(node):
    purchase_order_number = node.item.purchase_order.order_number
    quantity_received = _compute_quantity_received(node)
    total_value_received = quantity_received * node.item.sales_order_item.net_price
    quantity_dispensed = _compute_quantity_dispensed(node)
    value_dispensed = quantity_dispensed * node.item.sales_order_item.net_price

    return {
        'document_number': purchase_order_number,
        'total_value_received': total_value_received,
        'total_value_dispensed': value_dispensed,
        'balance': (total_value_received - value_dispensed),
        'items': [{'code': node.item.item.material_code,
                   'description': node.item.item.description,
                   'quantity_delivered': node.targeted_quantity,
                   'date_delivered': str(node.delivery_date),
                   'quantity_confirmed': quantity_received,
                   'date_confirmed': str(_get_date_received(node)),
                   'quantity_dispatched': quantity_dispensed,
                   'balance': quantity_received - quantity_dispensed}]
    }


def _get_responses(node):
    latest_run = node.latest_run()
    if latest_run:
        return latest_run.questions_and_responses()
    return {}


def _compute_quantity_received(node):
    responses = _get_responses(node)
    return responses.get('amountReceived', 0)


def _get_date_received(node):
    responses = _get_responses(node)
    return responses.get('dateOfReceipt', None)


def _compute_quantity_dispensed(node):
    total_quantity_dispensed = 0
    for child_node in node.children.all():
        responses = _get_responses(child_node)
        total_quantity_dispensed += responses.get('amountReceived', 0)
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




    


