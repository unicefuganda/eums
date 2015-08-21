from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

from eums.models import UserProfile, DistributionPlan, DistributionPlanNode


@api_view(['GET', ])
def ip_feedback_report(request):
    logged_in_user = request.user

    try:
        UserProfile.objects.get(user=logged_in_user)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    except:
        response = []
        deliveries = DistributionPlan.objects.filter(track=True)
        for delivery in deliveries:
            if request.GET.get('query'):
                filter_param = request.GET.get('query')
                nodes = DistributionPlanNode.objects.filter(distribution_plan=delivery,
                                                            item__item__description__icontains=filter_param)
            else:
                nodes = DistributionPlanNode.objects.filter(distribution_plan=delivery)
            node_answers = delivery.node_answers()
            if nodes:
                for node in nodes:
                    response.append({
                        'item_description': node.item.item.description,
                        'programme': node.distribution_plan.programme.name,
                        'consignee': node.consignee.name,
                        'order_number': node.item.number(),
                        'quantity_shipped': node.quantity_out(),
                        'answers': _filter_answers_by_id(node_answers, node.id)
                    })

        return Response(response, status=status.HTTP_200_OK)


def _filter_answers_by_id(answers, node_id):
    return filter(lambda answer: answer['id'] == node_id, answers)[0]['answers']
