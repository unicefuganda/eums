import logging
import time

from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param
from rest_framework.views import APIView

from eums.api.filter.filter_mixin import RequestFilterMixin
from eums.api.sorting.standard_dic_sort import StandardDicSort
from eums.models import DistributionPlanNode, DistributionPlan, Flow
from eums.permissions.stock_report_permissions import StockReportPermissions

PAGE_SIZE = 10
sort = StandardDicSort('last_shipment_date', 'last_received_date',
                       'total_value_received', 'total_value_dispensed', 'total_value_lost', 'balance')

mixin = RequestFilterMixin()

logger = logging.getLogger(__name__)


class StockReport(APIView):
    permission_classes = (StockReportPermissions,)

    def get(self, request):
        reduced_stock_report = filter_stock_report(request)
        totals = _compute_totals(reduced_stock_report)
        reduced_stock_report = sort.sort_by(request, reduced_stock_report)
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


def filter_stock_report(request):
    consignee_id = request.GET.get('consignee')
    location = request.GET.get('location')
    outcome_id = request.GET.get('outcome')
    from_date = request.GET.get('fromDate')
    to_date = request.GET.get('toDate')

    stock_report = _build_stock_report(consignee_id, location, outcome_id, from_date, to_date)
    reduced_stock_report = _reduce_stock_report(stock_report)
    return reduced_stock_report


def _build_stock_report(consignee_id, location, outcome_id, from_date, to_date):
    ip_nodes = DistributionPlanNode.objects.filter(
        Q(tree_position=Flow.Label.IMPLEMENTING_PARTNER) &
        (
            Q(distribution_plan__track=True) |
            (
                Q(distribution_plan__track=False) & Q(distribution_plan__is_auto_track_confirmed=True)
            )
        )
    )

    mixin.supported_filters = {
        "consignee_id": "consignee_id",
        "location": "location__icontains",
        "outcome_id": "programme_id",
        "from_date": "delivery_date__gte",
        "to_date": "delivery_date__lte"
    }
    filters = mixin.build_filters(
        {'consignee_id': consignee_id, 'location': location,
         'outcome_id': outcome_id, 'from_date': from_date, 'to_date': to_date})

    ip_nodes = ip_nodes.filter(**filters)
    return reduce(_aggregate_nodes_into_stock_report, ip_nodes, [])


def _aggregate_nodes_into_stock_report(stock_report, node):
    if node.item:
        stock_report.append(_get_report_details_for_node(node))
    return stock_report


def _get_report_details_for_node(node):
    purchase_order_number = node.item.number()
    quantity_received = _compute_quantity_received(node)
    total_value_received = quantity_received * node.item.unit_value()
    quantity_lost = node.total_amount_lost()
    total_value_lost = quantity_lost * node.item.unit_value()
    remark_lost = node.total_lost_remark()
    quantity_dispensed = node.quantity_out()
    value_dispensed = quantity_dispensed * node.item.unit_value()
    ip_delivery = DistributionPlan.objects.get(pk=node.distribution_plan.id)

    received_date = ip_delivery.received_date()

    quantity_in = node.quantity_in()

    result = {'document_number': purchase_order_number, 'programme': node.programme.name,
              'last_shipment_date': str(node.delivery_date), 'last_received_date': str(received_date),
              'total_value_received': total_value_received, 'total_value_dispensed': value_dispensed,
              'total_value_lost': total_value_lost,
              'balance': (total_value_received - value_dispensed - total_value_lost), 'items': [
            {'code': node.item.item.material_code, 'description': node.item.item.description, 'location': node.location,
             'consignee': node.consignee.name, 'quantity_delivered': quantity_in,
             'date_delivered': str(node.delivery_date), 'quantity_confirmed': quantity_received,
             'date_confirmed': str(received_date), 'quantity_dispatched': quantity_dispensed,
             'quantity_lost': quantity_lost, 'remark_lost': remark_lost,
             'balance': quantity_received - quantity_dispensed - quantity_lost}]}
    return result


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
    return responses.get('dateOfReceipt', '')


def _reduce_stock_report(stock_report):
    reduced_report = []
    for report_item in stock_report:
        matching_report_item = _find_item_in_stock_report(reduced_report, report_item)
        if matching_report_item:
            _update_report_item(matching_report_item, report_item)
        else:
            reduced_report.append(report_item)
    return sorted(reduced_report, key=lambda d: d.get('last_shipment_date'), reverse=True)


def _compute_totals(stock_report):
    total_received = round(
        reduce(lambda total, report_item: total + report_item['total_value_received'], stock_report, 0), 2)
    total_dispensed = round(
        reduce(lambda total, report_item: total + report_item['total_value_dispensed'], stock_report, 0), 2)
    total_lost = round(reduce(lambda total, report_item: total + report_item['total_value_lost'], stock_report, 0), 2)
    total_left = round(total_received - total_dispensed - total_lost, 2)

    return {
        'total_received': total_received,
        'total_dispensed': total_dispensed,
        'total_lost': total_lost,
        'balance': total_left
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
    matching_report_item['total_value_lost'] = matching_report_item['total_value_lost'] + report_item[
        'total_value_lost']
    matching_report_item['balance'] = matching_report_item['total_value_received'] - matching_report_item[
        'total_value_dispensed'] - matching_report_item['total_value_lost']
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
