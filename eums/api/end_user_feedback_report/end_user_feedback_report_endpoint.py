from django.core.paginator import Paginator
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param

from eums.models import UserProfile, DistributionPlan, DistributionPlanNode, PurchaseOrderItem, \
    ReleaseOrderItem, Runnable, Consignee, Option

PAGE_SIZE = 10


@api_view(['GET', ])
def end_user_feedback_report(request):
    logged_in_user = request.user

    if UserProfile.objects.filter(user=logged_in_user).exists():
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    response = []
    nodes = end_user_tracked_nodes(request)
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
        for run, answers in node_responses.iteritems():
            date_of_receipt = _get_delivery_date(answers)
            ip = node.get_ip()
            implementing_partner = ip['consignee']
            answer_list = {}
            for answer in answers:
                answer_list.update({answer.question.label: answer.value.text if isinstance(answer.value, Option) else answer.value})
            response.append({
                'item_description': node.item.item.description,
                'programme': node.programme.name,
                'consignee': node.consignee.name,
                'implementing_partner': implementing_partner.name,
                'order_number': node.item.number(),
                'date_of_receipt': date_of_receipt,
                'quantity_shipped': node.quantity_in(),
                'value': node.total_value,
                'answers': answer_list
            })

def end_user_tracked_nodes(request):
    if request.GET.get('query'):
        params = request.GET.get('query')
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=params)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=params)
        nodes = DistributionPlanNode.objects.filter(Q(tree_position=Runnable.END_USER),
                                                    Q(item__item__description__icontains=params) |
                                                    Q(consignee__name__icontains=params) |
                                                    Q(item=purchase_order_item) |
                                                    Q(item=release_order_item) |
                                                    Q(programme__name__icontains=params))
    else:
        nodes = DistributionPlanNode.objects.filter(tree_position=Runnable.END_USER)
    return nodes


def _filter_answers_by_id(answers, node_id):
    return filter(lambda answer: answer['id'] == node_id, answers)[0]['answers']
