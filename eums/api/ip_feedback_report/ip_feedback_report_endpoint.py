from django.core.paginator import Paginator
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

        paginated_results = Paginator(response, 10)
        page_number = get_page_number(request)

        reports_current_page = paginated_results.page(page_number)

        data = {
            'next': reports_current_page.has_next(),
            'previous': reports_current_page.has_previous(),
            'count': paginated_results.num_pages,
            'pageSize': len(reports_current_page.object_list),
            'results': reports_current_page.object_list
        }

        return Response(data, status=status.HTTP_200_OK)


def get_page_number(request):
    if request.GET.get('page'):
        return request.GET.get('page')
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
