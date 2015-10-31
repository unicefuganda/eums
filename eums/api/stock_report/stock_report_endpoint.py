from django.core.paginator import Paginator
from eums.models import DistributionPlanNode, Runnable
from rest_framework.utils.urls import replace_query_param
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

PAGE_SIZE = 10


class StockReport(APIView):
    def get(self, request):
        consignee_id = request.GET.get('consignee')
        location = request.GET.get('location')
        outcome_id = request.GET.get('outcome')
        stock_report = _build_stock_report(consignee_id, location, outcome_id)
        reduced_stock_report = _reduce_stock_report(stock_report)
        totals = _compute_totals(reduced_stock_report)

        paginated_results = Paginator(reduced_stock_report, PAGE_SIZE)

        page_number = _get_page_number(request)
        results_current_page = paginated_results.page(page_number)

        data = {
            'next': _has_page(results_current_page.has_next(), _get_page_number(request) + 1, request),
            'previous': _has_page(results_current_page.has_previous(), _get_page_number(request) - 1, request),
            'count': len(reduced_stock_report),
            'pageSize': PAGE_SIZE,
            'results': results_current_page.object_list,
            'totals': totals
        }

        return Response(data, status=status.HTTP_200_OK)


def _aggregate_nodes_into_stock_report(stock_report, node):
    if node.item:
        stock_report.append(_get_report_details_for_node(node))
    return stock_report


def _build_stock_report(consignee_id, location, outcome_id):
    ip_nodes = DistributionPlanNode.objects.filter(tree_position=Runnable.IMPLEMENTING_PARTNER)
    if consignee_id and location:
        ip_nodes = ip_nodes.filter(consignee_id=consignee_id, location__icontains=location)
    elif consignee_id:
        ip_nodes = ip_nodes.filter(consignee_id=consignee_id)
    elif location:
        ip_nodes = ip_nodes.filter(location__icontains=location)
    elif outcome_id:
        ip_nodes = ip_nodes.filter(programme_id=outcome_id)

    return reduce(_aggregate_nodes_into_stock_report, ip_nodes, [])


def _get_report_details_for_node(node):
    purchase_order_number = node.item.number()
    quantity_received = _compute_quantity_received(node)
    total_value_received = quantity_received * node.item.unit_value()
    quantity_dispensed = node.quantity_out()

    value_dispensed = quantity_dispensed * node.item.unit_value()

    return {
        'document_number': purchase_order_number,
        'programme': node.programme.name,
        'last_shipment_date': str(node.delivery_date),
        'total_value_received': total_value_received,
        'total_value_dispensed': value_dispensed,
        'balance': (total_value_received - value_dispensed),
        'items': [{'code': node.item.item.material_code,
                   'description': node.item.item.description,
                   'location': node.location,
                   'consignee': node.consignee.name,
                   'quantity_delivered': node.quantity_in(),
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


def _reduce_stock_report(stock_report):
    reduced_report = []
    for report_item in stock_report:
        matching_report_item = _find_item_in_stock_report(reduced_report, report_item)
        if matching_report_item:
            _update_report_item(matching_report_item, report_item)
        else:
            reduced_report.append(report_item)
    return reduced_report


def _compute_totals(stock_report):
    total_received = reduce(lambda total, report_item: total + report_item['total_value_received'], stock_report, 0)
    total_dispensed = reduce(lambda total, report_item: total + report_item['total_value_dispensed'], stock_report, 0)

    return {
        'total_received': total_received,
        'total_dispensed': total_dispensed,
        'balance': total_received - total_dispensed
    }


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

    if matching_report_item['last_shipment_date'] < report_item['last_shipment_date']:
        matching_report_item['last_shipment_date'] = report_item['last_shipment_date']


def _get_page_number(request):
    if request.GET.get('page'):
        return int(request.GET.get('page'))
    else:
        return 1


def _has_page(has_page, page, request):
    base_url = replace_query_param(request.build_absolute_uri(), 'page', page)
    return None if has_page is False else base_url
