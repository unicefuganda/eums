from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import SalesOrderItem


class SalesOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderItem
        fields = ('id', 'sales_order', 'item', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date', 'distributionplanlineitem_set')


class SalesOrderItemViewSet(ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerialiser


salesOrderItemRouter = DefaultRouter()
salesOrderItemRouter.register(r'sales-order-item', SalesOrderItemViewSet)
