from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param

from eums.api.sorting.standard_dic_sort import StandardDicSort
from eums.models import UserProfile, DistributionPlanNode, PurchaseOrderItem, \
    ReleaseOrderItem, Option, MultipleChoiceAnswer, Question
from eums.utils import get_lists_intersection

PAGE_SIZE = 10
ITEM_QUESTIONS = {'received': (Question.LABEL.itemReceived, Question.LABEL.productReceived),
                  'satisfied': (Question.LABEL.satisfiedWithProduct,),
                  'quality': (Question.LABEL.qualityOfProduct,)}
sort = StandardDicSort('quantity_shipped', 'value', 'dateOfReceipt', 'amountReceived')


@api_view(['GET', ])
def item_feedback_report(request):
    response = filter_item_feedback_report(request)
    response = sort.sort_by(request, response)
    paginated_results = Paginator(response, PAGE_SIZE)
    page_number = get_page_number(request)

    reports_current_page = paginated_results.page(page_number)

    data = {
        'next': _has_page(reports_current_page.has_next(), get_page_number(request) + 1, request),
        'previous': _has_page(reports_current_page.has_previous(), get_page_number(request) - 1, request),
        'count': len(response),
        'pageSize': PAGE_SIZE,
        'results': reports_current_page.object_list,
        'programmeIds': _get_programme_ids(response)
    }

    return Response(data, status=status.HTTP_200_OK)


def filter_item_feedback_report(request):
    logged_in_user = request.user
    user_profile = UserProfile.objects.filter(user=logged_in_user).first()
    ip = None
    if user_profile:
        ip = user_profile.consignee
    response = []
    nodes = item_tracked_nodes(request, ip)
    nodes = filter_answers(request, nodes, ITEM_QUESTIONS)
    if nodes:
        build_answers_for_nodes(nodes, response)
    return response


def filter_answers(request, nodes, questions):
    runs_list = []
    for key, value in questions.iteritems():
        param = request.GET.get(key)
        if param:
            runs = MultipleChoiceAnswer.objects.filter(question__label__in=value,
                                                       value__text__iexact=param,
                                                       run__status__in=('scheduled', 'completed'),
                                                       run__runnable__in=nodes).values_list('run_id')
            runs_list.append(runs)

    if runs_list:
        nodes = nodes.filter(run__in=get_lists_intersection(runs_list))

    return nodes


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
        node_plan_responses = node.distribution_plan.responses() if node.distribution_plan else {}
        answer_list = _build_answer_list(node_responses)
        plan_answer_list = _build_answer_list(node_plan_responses)
        delivery_node = {
            'item_description': node.item.item.description,
            'programme': {'id': node.programme.id, 'name': node.programme.name},
            'consignee': node.consignee.name,
            'implementing_partner': node.ip.name,
            'order_number': node.item.number(),
            'quantity_shipped': node.quantity_in(),
            'value': node.total_value,
            'plan_answers': plan_answer_list,
            'answers': answer_list,
            'location': node.location,
            'tree_position': node.tree_position}
        delivery_node.update(answer_list)
        delivery_node['dateOfReceipt'] = answer_list.get('dateOfReceipt') \
            if answer_list.get('dateOfReceipt') \
            else plan_answer_list.get('dateOfReceipt')

        response.append(delivery_node)


def _build_answer_list(node_responses):
    answer_list = {}
    for run, answers in node_responses.iteritems():
        for answer in answers:
            answer_list.update(
                    {answer.question.label: answer.value.text if isinstance(answer.value, Option) else answer.value})
    return answer_list


def item_tracked_nodes(request, ip=None):
    nodes = _filter_track_and_confirmed_auto_track_nodes(request)

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


def _filter_track_and_confirmed_auto_track_nodes(request):
    nodes = DistributionPlanNode.objects.filter(
            Q(track=True) | (Q(track=False) & Q(distribution_plan__is_auto_track_confirmed=True)))
    kwargs = {}
    params = dict((key, value[0]) for key, value in dict(request.GET).iteritems())
    kwargs.update(_filter_fields(params))
    return nodes.filter(**kwargs)


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


def _get_programme_ids(results):
    programme_ids = []
    for result in results:
        if not programme_ids.__contains__(result['programme']['id']):
            programme_ids.append(result['programme']['id'])
    return programme_ids
