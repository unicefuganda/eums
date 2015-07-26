from rest_framework import serializers
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from rest_framework.viewsets import ModelViewSet

from eums.api.distribution_plan.distribution_plan_endpoint import DistributionPlanSerialiser
from eums.models import PurchaseOrder


class PurchaseOrderSerialiser(serializers.ModelSerializer):
    programme_name = serializers.CharField(read_only=True, source='sales_order.programme.name')
    programme = serializers.IntegerField(read_only=True, source='sales_order.programme.id')

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'order_number', 'date', 'sales_order', 'po_type', 'programme_name', 'purchaseorderitem_set',
                  'release_orders', 'programme', 'is_single_ip', 'has_plan', 'is_fully_delivered')


class PurchaseOrderViewSet(ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('order_number')
    serializer_class = PurchaseOrderSerialiser

    def list(self, request, *args, **kwargs):
        consignee_id = request.GET.get('consignee', None)
        if consignee_id:
            orders = PurchaseOrder.objects.for_consignee(consignee_id).order_by('order_number')
        else:
            orders = self.get_queryset()
        return Response(self.get_serializer(orders, many=True).data)

    @list_route()
    def for_direct_delivery(self, _):
        purchase_orders = PurchaseOrder.objects.for_direct_delivery()
        return Response(self.get_serializer(purchase_orders, many=True).data)

    @detail_route()
    def deliveries(self, _, pk=None):
        purchase_order = self.get_object()
        deliveries = purchase_order.deliveries()
        return Response(DistributionPlanSerialiser(deliveries, many=True).data)

    @detail_route()
    def total_value(self, _, pk=None):
        return Response(self.get_object().total_value())


purchaseOrderRouter = DefaultRouter()
purchaseOrderRouter.register(r'purchase-order', PurchaseOrderViewSet)
