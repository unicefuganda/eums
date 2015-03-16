from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import ReleaseOrder


class ReleaseOrderSerialiser(serializers.ModelSerializer):
    programme = serializers.SerializerMethodField('get_programme')

    class Meta:
        model = ReleaseOrder
        fields = ('id', 'order_number', 'sales_order', 'purchase_order', 'programme', 'consignee', 'waybill', 'delivery_date',
                  'releaseorderitem_set')

    @staticmethod
    def get_programme(release_order):
        return release_order.sales_order.programme.name


class ReleaseOrderViewSet(ModelViewSet):
    queryset = ReleaseOrder.objects.all().order_by('order_number')
    serializer_class = ReleaseOrderSerialiser


releaseOrderRouter = DefaultRouter()
releaseOrderRouter.register(r'release-order', ReleaseOrderViewSet)