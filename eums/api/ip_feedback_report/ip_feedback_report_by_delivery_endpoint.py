import logging

from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param
from rest_framework.views import APIView
from django.core.urlresolvers import reverse

from eums import settings
from eums.api.sorting.standard_dic_sort import StandardDicSort
from eums.models import UserProfile, DistributionPlan, Question, PurchaseOrderItem, ReleaseOrderItem, \
    DistributionPlanNode, Flow, Upload
from eums.permissions.delivery_feedback_report_permissions import DeliveryFeedbackReportPermissions

PAGE_SIZE = 10
DELIVERY_QUESTIONS = {'received': Question.LABEL.deliveryReceived,
                      'satisfied': Question.LABEL.satisfiedWithDelivery,
                      'good_condition': Question.LABEL.isDeliveryInGoodOrder}
sort = StandardDicSort('shipmentDate', 'dateOfReceipt', 'value')

logger = logging.getLogger(__name__)


class IpFeedbackReportEndpoint(APIView):
    permission_classes = (DeliveryFeedbackReportPermissions,)

    def get(self, request):
        return ip_feedback_by_delivery_endpoint(request)


def ip_feedback_by_delivery_endpoint(request):
    deliveries = filter_delivery_feedback_report(request)

    results = sort.sort_by(request, deliveries)
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


def filter_delivery_feedback_report(request):
    deliveries = _filter_po_way_bill(request)
    deliveries = _filter_ip(request, deliveries)
    deliveries = _filter_answers(request, deliveries)

    return _build_delivery_result(deliveries, request)


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


def _build_delivery_result(deliveries, request, isExport=False):
    delivery_answers = []
    host_name = request.build_absolute_uri(reverse('home'))

    for delivery in deliveries:
        answers = delivery.answers()
        uploads, ab_uploads = _get_uploads(delivery, host_name)
        delivery_answers.append(
                {Question.LABEL.deliveryReceived: _get_answer(Question.LABEL.deliveryReceived, answers),
                 'shipmentDate': delivery.delivery_date,
                 Question.LABEL.dateOfReceipt: _get_answer(Question.LABEL.dateOfReceipt, answers),
                 'orderNumber': delivery.number(),
                 'programme': {'id': delivery.programme.id, 'name': delivery.programme.name},
                 'consignee': {'id': delivery.consignee.id, 'name': delivery.consignee.name},
                 Question.LABEL.isDeliveryInGoodOrder:
                     _get_answer(Question.LABEL.isDeliveryInGoodOrder, answers),
                 Question.LABEL.satisfiedWithDelivery:
                     _get_answer(Question.LABEL.satisfiedWithDelivery, answers),
                 Question.LABEL.additionalDeliveryComments:
                     _get_answer(Question.LABEL.additionalDeliveryComments, answers),
                 'value': int(delivery.total_value),
                 'location': delivery.location,
                 'urls': uploads,
                 'absoluteUrls': ab_uploads,
                 'contactPersonId': delivery.contact_person_id
                 })

    return sorted(delivery_answers, key=lambda d: d.get('shipmentDate'), reverse=True)


def _get_page_number(request):
    if request.GET.get('page'):
        return int(request.GET.get('page'))
    else:
        return 1


def _has_page(has_page, page, request):
    base_url = replace_query_param(request.build_absolute_uri(), 'page', page)
    return None if has_page is False else base_url


def _filter_answers(request, deliveries):
    ids = []
    for delivery in deliveries:
        answers = delivery.answers()
        expected_delivery = True
        for key, value in _get_query_answer_from_url(request, DELIVERY_QUESTIONS).iteritems():
            if _get_answer(key, answers) != value:
                expected_delivery = False
        if expected_delivery:
            ids.append(delivery.id)

    return deliveries.filter(id__in=ids)


def _filter_ip(request, deliveries):
    logged_in_user = request.user
    user_profile = UserProfile.objects.filter(user=logged_in_user).first()
    ip = None
    if user_profile:
        ip = user_profile.consignee
    if ip:
        deliveries = deliveries.filter(ip=ip)
    return deliveries


def _filter_po_way_bill(request):
    nodes = _filter_track_and_confirmed_auto_track_nodes(request)
    po_way_bill = request.GET.get('po_waybill')
    if po_way_bill:
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=po_way_bill)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=po_way_bill)
        nodes = nodes.filter(Q(item=purchase_order_item) |
                             Q(item=release_order_item))
    delivery_ids = nodes.values_list('distribution_plan', flat=True)
    deliveries = DistributionPlan.objects.filter(id__in=delivery_ids)
    return deliveries


def _filter_track_and_confirmed_auto_track_nodes(request):
    nodes = DistributionPlanNode.objects.filter(Q(distribution_plan__track=True) | (
        Q(distribution_plan__track=False) & Q(distribution_plan__is_auto_track_confirmed=True)))

    kwargs = {'tree_position': Flow.Label.IMPLEMENTING_PARTNER}
    params = dict((key, value[0]) for key, value in dict(request.GET).iteritems())
    kwargs.update(_filter_fields(params))

    return nodes.filter(**kwargs)


def _filter_fields(params):
    query_fields = {'programme_id': 'programme_id', 
                    'consignee_id': 'distribution_plan__consignee_id',
                    'location': 'location__iexact'}
    search_params = {}
    for key, value in params.iteritems():
        query_field = query_fields.get(key)
        if query_field and value:
            search_params.update({query_field: value})
    return search_params


def _get_query_answer_from_url(request, questions):
    answers_filters = {}
    for key, value in questions.iteritems():
        param = request.GET.get(key)
        if param:
            answers_filters[value] = param

    return answers_filters


def _get_answer(question_label, answers):
    return filter(lambda answer: answer['question_label'] == question_label, answers)[0]['value']


def _get_uploads(delivery, host_name):
    data = []
    ab_data = []
    media_url = settings.MEDIA_URL

    uploads = Upload.objects.filter(plan=delivery)
    for upload in uploads.iterator():
        data.append(str(upload.file))
        ab_data.append(host_name + media_url[1:] + str(upload.file))
    return data, ab_data
