from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import PurchaseOrderItem


class PurchaseOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ('id', 'purchase_order', 'item_number', 'quantity', 'value', 'sales_order_item', 'item')


class PurchaseOrderItemViewSet(ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerialiser


purchaseOrderItemRouter = DefaultRouter()
purchaseOrderItemRouter.register(r'purchase-order-item', PurchaseOrderItemViewSet)
