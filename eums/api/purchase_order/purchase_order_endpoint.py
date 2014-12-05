from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import PurchaseOrder


class PurchaseOrderSerialiser(serializers.ModelSerializer):
    programme = serializers.SerializerMethodField('get_programme')

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'order_number', 'date', 'sales_order', 'programme', 'purchaseorderitem_set')

    @staticmethod
    def get_programme(purchase_order):
        return purchase_order.sales_order.programme.name


class PurchaseOrderViewSet(ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerialiser


purchaseOrderRouter = DefaultRouter()
purchaseOrderRouter.register(r'purchase-order', PurchaseOrderViewSet)