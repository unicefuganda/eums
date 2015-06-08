from django.db.models import Count
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import SalesOrder


class SalesOrderSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SalesOrder
        fields = ('id', 'order_number', 'date', 'programme', 'description', 'salesorderitem_set', 'release_orders')


class SalesOrderViewSet(ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerialiser

    def list(self, request, *args, **kwargs):
        has_release_orders = request.GET.get('has_release_orders', True)
        annotated = SalesOrder.objects.annotate(release_order_count=Count('release_orders'))
        if has_release_orders == 'false':
            sales_orders = annotated.filter(release_order_count=0)
        elif has_release_orders == 'true':
            sales_orders = annotated.filter(release_order_count__gte=1)
        else:
            sales_orders = SalesOrder.objects.all()

        return Response(SalesOrderSerialiser(sales_orders, many=True).data)


salesOrderRouter = DefaultRouter()
salesOrderRouter.register(r'sales-order', SalesOrderViewSet)