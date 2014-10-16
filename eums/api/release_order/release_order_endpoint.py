from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import ReleaseOrder


class ReleaseOrderSerialiser(serializers.ModelSerializer):
    class Meta:
        model = ReleaseOrder
        fields = ('id', 'order_number', 'sales_order', 'consignee', 'waybill', 'delivery_date',
                  'releaseorderitem_set')


class ReleaseOrderViewSet(ModelViewSet):
    queryset = ReleaseOrder.objects.all()
    serializer_class = ReleaseOrderSerialiser


releaseOrderRouter = DefaultRouter()
releaseOrderRouter.register(r'release-order', ReleaseOrderViewSet)