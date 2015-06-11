from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import SalesOrder


class SalesOrderSerialiser(serializers.ModelSerializer):
    has_plan = serializers.BooleanField(read_only=True, source='has_plan')
    class Meta:
        model = SalesOrder
        fields = ('id', 'order_number', 'date', 'programme', 'description', 'salesorderitem_set', 'release_orders',
                  'has_plan')


class SalesOrderViewSet(ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerialiser

    def list(self, request, *args, **kwargs):
        has_release_orders = request.GET.get('has_release_orders', True)
        if has_release_orders == 'false':
            sales_orders = SalesOrder.objects.without_release_orders()
        elif has_release_orders == 'true':
            sales_orders = SalesOrder.objects.with_release_orders()
        else:
            sales_orders = SalesOrder.objects.all()

        return Response(SalesOrderSerialiser(sales_orders, many=True).data)


salesOrderRouter = DefaultRouter()
salesOrderRouter.register(r'sales-order', SalesOrderViewSet)