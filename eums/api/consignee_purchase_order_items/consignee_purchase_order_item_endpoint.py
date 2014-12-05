from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanLineItem, PurchaseOrderItem


class ConsigneePurchaseOrderItems(APIView):
    def get(self, _, consignee_id, purchase_order_id):
        sales_order_items_ids = DistributionPlanLineItem.objects.filter(distribution_plan_node__consignee_id=consignee_id, distribution_plan_node__parent_id__isnull=True).values('item_id')
        responses = self._get_purchase_orders_items_for_(sales_order_items_ids, purchase_order_id) if sales_order_items_ids else []
        return Response(responses, status=status.HTTP_200_OK)

    def _get_purchase_orders_items_for_(self, sales_order_items_ids, purchase_order_id):
        return PurchaseOrderItem.objects.filter(sales_order_item_id__in=sales_order_items_ids, purchase_order_id=purchase_order_id).values_list('id', flat=True)

class ConsigneePurchaseOrderItemNode(APIView):
    def get(self, _, consignee_id, sales_order_item_id):
        responses = DistributionPlanLineItem.objects.get(distribution_plan_node__consignee_id=consignee_id, item_id=sales_order_item_id, distribution_plan_node__parent_id__isnull=True).distribution_plan_node_id
        return Response(responses, status=status.HTTP_200_OK)