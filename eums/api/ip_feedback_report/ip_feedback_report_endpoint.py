from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

from eums.models import UserProfile, DistributionPlan, DistributionPlanNode, PurchaseOrderItem, \
    ReleaseOrderItem


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
            nodes = get_tracked_nodes(delivery, request)
            if nodes:
                build_answers_for_nodes(delivery, nodes, response)

        return Response(response, status=status.HTTP_200_OK)


def build_answers_for_nodes(delivery, nodes, response):
    node_answers = delivery.node_answers()
    for node in nodes:
        response.append({
            'item_description': node.item.item.description,
            'programme': node.distribution_plan.programme.name,
            'consignee': node.consignee.name,
            'order_number': node.item.number(),
            'quantity_shipped': node.quantity_out(),
            'answers': _filter_answers_by_id(node_answers, node.id)
        })


def get_tracked_nodes(delivery, request):
    if request.GET.get('query'):
        params = request.GET.get('query')
        purchase_order_item = PurchaseOrderItem.objects.filter(purchase_order__order_number__icontains=params)
        release_order_item = ReleaseOrderItem.objects.filter(release_order__waybill__icontains=params)
        nodes = DistributionPlanNode.objects.filter(Q(distribution_plan=delivery),
                                                    Q(item__item__description__icontains=params) |
                                                    Q(consignee__name__icontains=params) |
                                                    Q(item=purchase_order_item) |
                                                    Q(item=release_order_item) |
                                                    Q(distribution_plan__programme__name__icontains=params))
    else:
        nodes = DistributionPlanNode.objects.filter(distribution_plan=delivery)
    return nodes


def _filter_answers_by_id(answers, node_id):
    return filter(lambda answer: answer['id'] == node_id, answers)[0]['answers']
