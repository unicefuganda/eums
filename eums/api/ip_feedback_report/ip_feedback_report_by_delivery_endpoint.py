from eums.models import UserProfile, DistributionPlan, Question
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def ip_feedback_by_delivery_endpoint(request):
    logged_in_user = request.user
    if UserProfile.objects.filter(user=logged_in_user).exists():
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    return Response(data={'results':_build_delivery_answers()}, status=status.HTTP_200_OK)


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