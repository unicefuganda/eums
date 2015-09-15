from django.core.paginator import Paginator
from eums.models import UserProfile, DistributionPlan, Question
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

    results = _build_delivery_answers()
    paginated_results = Paginator(results, PAGE_SIZE)

    page_number = _get_page_number(request)
    results_current_page = paginated_results.page(page_number)

    data = {
        'next': _has_page(results_current_page.has_next(), _get_page_number(request) + 1, request),
        'previous': _has_page(results_current_page.has_previous(), _get_page_number(request) - 1, request),
        'count': len(results),
        'pageSize': PAGE_SIZE,
        'results': results_current_page.object_list
    }

    return Response(data=data, status=status.HTTP_200_OK)


def _build_delivery_answers():
    deliveries = DistributionPlan.objects.filter(track=True)
    delivery_answers = []
    for delivery in deliveries:
        answers = delivery.answers()
        delivery_answers.append({Question.LABEL.deliveryReceived: _value(Question.LABEL.deliveryReceived, answers),
                                 Question.LABEL.dateOfReceipt: _value(Question.LABEL.dateOfReceipt, answers),
                                 'orderNumber': delivery.number(),
                                 'programme': delivery.programme.name,
                                 'consignee': delivery.consignee.name,
                                 Question.LABEL.isDeliveryInGoodOrder:
                                     _value(Question.LABEL.isDeliveryInGoodOrder, answers),
                                 Question.LABEL.satisfiedWithDelivery:
                                     _value(Question.LABEL.satisfiedWithDelivery, answers),
                                 Question.LABEL.additionalDeliveryComments:
                                     _value(Question.LABEL.additionalDeliveryComments, answers)
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