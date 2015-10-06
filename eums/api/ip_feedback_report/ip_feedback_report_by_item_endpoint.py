from django.core.paginator import Paginator
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param

from eums.models import UserProfile, DistributionPlan, DistributionPlanNode, PurchaseOrderItem, \
    ReleaseOrderItem, Runnable

PAGE_SIZE = 10


@api_view(['GET', ])
def ip_feedback_report_by_item(request):
    logged_in_user = request.user

    if UserProfile.objects.filter(user=logged_in_user).exists():
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    response = []
    deliveries = DistributionPlan.objects.filter(track=True)
    for delivery in deliveries:
        nodes = get_tracked_nodes(delivery, request)
        if nodes:
            build_answers_for_nodes(delivery, nodes, response)

    paginated_results = Paginator(response, PAGE_SIZE)
    page_number = get_page_number(request)

    reports_current_page = paginated_results.page(page_number)

    data = {
        'next': _has_page(reports_current_page.has_next(), get_page_number(request) + 1, request),
        'previous': _has_page(reports_current_page.has_previous(), get_page_number(request) - 1, request),
        'count': len(response),
        'pageSize': PAGE_SIZE,
        'results': reports_current_page.object_list
    }

    return Response(data, status=status.HTTP_200_OK)


def _has_page(has_page, page, request):
    base_url = replace_query_param(request.build_absolute_uri(), 'page', page)
    return None if has_page is False else base_url


def get_page_number(request):
    if request.GET.get('page'):
        return int(request.GET.get('page'))
    else:
        return 1


def _get_delivery_data(delivery_answers):
    date_answer = filter(lambda answers: answers['question_label'] == 'dateOfReceipt', delivery_answers)[0]
    return date_answer['value']


def build_answers_for_nodes(delivery, nodes, response):
    delivery_answers = delivery.answers()
    date_of_receipt = _get_delivery_data(delivery_answers)
    node_answers = delivery.node_answers()
    for node in nodes:
        response.append({
            'item_description': node.item.item.description,
            'programme': node.distribution_plan.programme.name,
            'consignee': node.consignee.name,
            'order_number': node.item.number(),
            'date_of_receipt': date_of_receipt,
            'quantity_shipped': node.quantity_in(),
            'value': node.total_value,
            'answers': _filter_answers_by_id(node_answers, node.id)
        })


def get_tracked_nodes(delivery, request):
    po_way_bill = request.GET.get('po_waybill')
    nodes = DistributionPlanNode.objects.filter(**_query_args(request, delivery))

    if po_way_bill:
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=po_way_bill)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=po_way_bill)
        return nodes.filter(Q(item=purchase_order_item) |
                            Q(item=release_order_item))
    return nodes


def _query_args(request, delivery):
    kwargs = {'distribution_plan': delivery,
              'tree_position': Runnable.IMPLEMENTING_PARTNER}
    params = dict((key, value[0]) for key, value in dict(request.GET).iteritems())
    kwargs.update(_filter_fields(params))
    return kwargs


def _filter_fields(params):
    query_fields = {'programme_id': 'programme_id', 'consignee_id': 'consignee_id',
                    'item_description': 'item__item__description__icontains'}
    search_params = {}
    for key, value in params.iteritems():
        query_field = query_fields.get(key)
        if query_field:
            search_params.update({query_field: value})
    return search_params


def _filter_answers_by_id(answers, node_id):
    node_answers = filter(lambda answer: answer['id'] == node_id, answers)
    return node_answers[0]['answers']