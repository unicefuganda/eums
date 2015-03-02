from django.forms.models import model_to_dict
from rest_framework import serializers,status
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response

from eums.models import SalesOrderItem, PurchaseOrderItem, PurchaseOrder


class SalesOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderItem
        fields = ('id', 'sales_order', 'item', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date',
                  'item_number', 'distributionplanlineitem_set')


class SalesOrderItemViewSet(ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerialiser


salesOrderItemRouter = DefaultRouter()
salesOrderItemRouter.register(r'sales-order-item', SalesOrderItemViewSet)


class soItemPOItem(APIView):
    def get(self, _, sales_order_item_id):
        response = self._get_purchase_orders_for_(sales_order_item_id) if sales_order_item_id else []
        return Response(response, status=status.HTTP_200_OK)

    def _get_purchase_orders_for_(self, sales_order_items_id):
        purchase_order_item_set = PurchaseOrderItem.objects.filter(sales_order_item=sales_order_items_id)
        if purchase_order_item_set:
            purchase_order_item = purchase_order_item_set[0]
            purchase_order = purchase_order_item.purchase_order

            formatted_purchase_dict = model_to_dict(purchase_order_item)
            formatted_purchase_dict['purchase_order'] = model_to_dict(purchase_order)
            return formatted_purchase_dict
        else:
            return {}
