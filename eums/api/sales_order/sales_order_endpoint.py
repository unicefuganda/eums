from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import SalesOrder


class SalesOrderSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SalesOrder
        fields = ('id', 'order_number', 'item', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date')


class SalesOrderViewSet(ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerialiser


salesOrderRouter = DefaultRouter()
salesOrderRouter.register(r'sales-order', SalesOrderViewSet)