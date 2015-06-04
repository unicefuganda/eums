from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanNode, SalesOrderItem, PurchaseOrder


class ConsigneePurchaseOrders(APIView):
    def get(self, _, consignee_id):
        sales_order_items_ids = DistributionPlanNode.objects.filter(consignee_id=consignee_id,
                                                                    parent_id__isnull=True).values('item_id')
        responses = self._get_purchase_orders_for_(sales_order_items_ids) if sales_order_items_ids else []
        return Response(responses, status=status.HTTP_200_OK)

    def _get_purchase_orders_for_(self, sales_order_items_ids):
        sales_order_ids = SalesOrderItem.objects.filter(id__in=sales_order_items_ids).values('sales_order_id')
        return self._serialize_purchaseorders(PurchaseOrder.objects.filter(sales_order_id__in=sales_order_ids))

    def _serialize_purchaseorders(self, purchaseorders):
        result = []
        for purchase_order in purchaseorders:
            formatted_purchase_order = {
                "id": purchase_order.id,
                "order_number": purchase_order.order_number,
                "date": purchase_order.date,
                "sales_order": purchase_order.sales_order_id,
                "programme": purchase_order.sales_order.programme.name,
                "purchaseorderitem_set": purchase_order.purchaseorderitem_set.values_list('id', flat=True)
            }
            result.append(formatted_purchase_order)
        return result