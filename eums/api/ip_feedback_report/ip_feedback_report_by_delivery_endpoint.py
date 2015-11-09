from django.core.paginator import Paginator
from django.db.models import Q
from eums.models import UserProfile, DistributionPlan, Question, PurchaseOrderItem, ReleaseOrderItem, \
    DistributionPlanNode, Runnable
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param

PAGE_SIZE = 10


@api_view(['GET'])
def ip_feedback_by_delivery_endpoint(request):
    logged_in_user = request.user
    if UserProfile.objects.filter(user=logged_in_user).exists():
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    deliveries = _get_filtered_deliveries(request)
    results = _build_delivery_answers(deliveries)
    paginated_results = Paginator(results, PAGE_SIZE)

    page_number = _get_page_number(request)
    results_current_page = paginated_results.page(page_number)

    data = {
        'next': _has_page(results_current_page.has_next(), _get_page_number(request) + 1, request),
        'previous': _has_page(results_current_page.has_previous(), _get_page_number(request) - 1, request),
        'count': len(results),
        'pageSize': PAGE_SIZE,
        'results': results_current_page.object_list,
        'ipIds': _get_ip_ids(results),
        'programmeIds': _get_programme_ids(results),
    }

    return Response(data=data, status=status.HTTP_200_OK)


def _get_ip_ids(results):
    ip_ids = []
    for result in results:
        if not ip_ids.__contains__(result['consignee']['id']):
            ip_ids.append(result['consignee']['id'])
    return ip_ids


def _get_programme_ids(results):
    programme_ids = []
    for result in results:
        if not programme_ids.__contains__(result['programme']['id']):
            programme_ids.append(result['programme']['id'])
    return programme_ids


def _build_delivery_answers(deliveries):
    delivery_answers = []
    for delivery in deliveries:
        answers = delivery.answers()
        delivery_answers.append({Question.LABEL.deliveryReceived: _value(Question.LABEL.deliveryReceived, answers),
                                 'shipmentDate': delivery.delivery_date,
                                 Question.LABEL.dateOfReceipt: _value(Question.LABEL.dateOfReceipt, answers),
                                 'orderNumber': delivery.number(),
                                 'programme': {'id': delivery.programme.id, 'name': delivery.programme.name},
                                 'consignee': {'id': delivery.consignee.id, 'name': delivery.consignee.name},
                                 Question.LABEL.isDeliveryInGoodOrder:
                                     _value(Question.LABEL.isDeliveryInGoodOrder, answers),
                                 Question.LABEL.satisfiedWithDelivery:
                                     _value(Question.LABEL.satisfiedWithDelivery, answers),
                                 Question.LABEL.additionalDeliveryComments:
                                     _value(Question.LABEL.additionalDeliveryComments, answers),
                                 'value': int(delivery.total_value),
                                 'location': delivery.location
                                 })
    return delivery_answers


def _value(question_label, answers):
    return filter(lambda answer: answer['question_label'] == question_label, answers)[0]['value']


def _get_page_number(request):
    if request.GET.get('page'):
        return int(request.GET.get('page'))
    else:
        return 1


def _has_page(has_page, page, request):
    base_url = replace_query_param(request.build_absolute_uri(), 'page', page)
    return None if has_page is False else base_url


def _get_filtered_deliveries(request):
    po_way_bill = request.GET.get('po_waybill')
    nodes = DistributionPlanNode.objects.filter(**_query_args(request))

    if po_way_bill:
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=po_way_bill)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=po_way_bill)
        nodes = nodes.filter(Q(item=purchase_order_item) |
                            Q(item=release_order_item))
    delivery_ids = nodes.values_list('distribution_plan', flat=True)
    return DistributionPlan.objects.filter(id__in=delivery_ids)


def _query_args(request):
    kwargs = {'distribution_plan__track': True,
              'tree_position': Runnable.IMPLEMENTING_PARTNER}
    params = dict((key, value[0]) for key, value in dict(request.GET).iteritems())
    kwargs.update(_filter_fields(params))
    return kwargs


def _filter_fields(params):
    query_fields = {'programme_id': 'programme_id', 'consignee_id': 'distribution_plan__consignee_id', 'location': 'location'}
    search_params = {}
    for key, value in params.iteritems():
        query_field = query_fields.get(key)
        if query_field and value:
            search_params.update({query_field: value})
    return search_params
