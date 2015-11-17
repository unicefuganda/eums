from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param
from eums.models import UserProfile, DistributionPlanNode, PurchaseOrderItem, \
    ReleaseOrderItem, Option

PAGE_SIZE = 10


@api_view(['GET', ])
def item_feedback_report(request):
    logged_in_user = request.user
    user_profile = UserProfile.objects.filter(user=logged_in_user).first()
    ip = None
    if user_profile:
        ip = user_profile.consignee

    response = []
    nodes = item_tracked_nodes(request, ip)
    if nodes:
        build_answers_for_nodes(nodes, response)

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


def _get_delivery_date(delivery_answers):
    date_answers = filter(lambda answer: answer.question.label == 'dateOfReceipt', delivery_answers)
    if len(date_answers):
        return date_answers[0].value


def build_answers_for_nodes(nodes, response):
    for node in nodes:
        node_responses = node.responses()
        answer_list = {}
        for run, answers in node_responses.iteritems():
            for answer in answers:
                answer_list.update(
                    {answer.question.label: answer.value.text if isinstance(answer.value, Option) else answer.value})
        response.append({
            'item_description': node.item.item.description,
            'programme': node.programme.name,
            'consignee': node.consignee.name,
            'implementing_partner': node.ip.name,
            'order_number': node.item.number(),
            'quantity_shipped': node.quantity_in(),
            'value': node.total_value,
            'answers': answer_list,
            'location': node.location,
            'tree_position': node.tree_position
        })


def item_tracked_nodes(request, ip=None):
    nodes = DistributionPlanNode.objects.filter(**_query_args(request))

    po_waybill = request.GET.get('po_waybill')
    if po_waybill:
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=po_waybill)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=po_waybill)
        nodes = nodes.filter(Q(item=purchase_order_item) |
                             Q(item=release_order_item))

    if ip:
        nodes = nodes.filter(ip=ip)

    nodes = nodes.order_by('programme__name')
    return nodes


def _filter_answers_by_id(answers, node_id):
    return filter(lambda answer: answer['id'] == node_id, answers)[0]['answers']


def _query_args(request):
    kwargs = {'track': True}
    params = dict((key, value[0]) for key, value in dict(request.GET).iteritems())
    kwargs.update(_filter_fields(params))
    return kwargs


def _filter_fields(params):
    query_fields = {'programme_id': 'programme_id', 'ip_id': 'ip_id',
                    'location': 'location__iexact', 'tree_position': 'tree_position',
                    'item_description': 'item__item__description__icontains'}

    search_params = {}
    for key, value in params.iteritems():
        query_field = query_fields.get(key)
        if query_field and value:
            search_params.update({query_field: value})
    return search_params
