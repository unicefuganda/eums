from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import ReleaseOrderItem


class ReleaseOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = ReleaseOrderItem
        fields = ('id', 'release_order', 'item', 'item_number', 'quantity', 'value', 'purchase_order_item')


class ReleaseOrderItemViewSet(ModelViewSet):
    queryset = ReleaseOrderItem.objects.all()
    serializer_class = ReleaseOrderItemSerialiser


releaseOrderItemRouter = DefaultRouter()
releaseOrderItemRouter.register(r'release-order-item', ReleaseOrderItemViewSet)
