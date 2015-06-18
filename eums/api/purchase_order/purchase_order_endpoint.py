from rest_framework import serializers
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet


from eums.models import PurchaseOrder


class PurchaseOrderSerialiser(serializers.ModelSerializer):
    programme_name = serializers.CharField(read_only=True, source='sales_order.programme.name')
    programme = serializers.IntegerField(read_only=True, source='sales_order.programme.id')

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'order_number', 'date', 'sales_order', 'programme_name',
                  'purchaseorderitem_set', 'release_orders', 'programme')


class PurchaseOrderViewSet(ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('order_number')
    serializer_class = PurchaseOrderSerialiser

    @list_route()
    def for_direct_delivery(self, _):
        purchase_orders = PurchaseOrder.objects.for_direct_delivery()
        return Response(self.get_serializer(purchase_orders, many=True).data)


purchaseOrderRouter = DefaultRouter()
purchaseOrderRouter.register(r'purchase-order', PurchaseOrderViewSet)