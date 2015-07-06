from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import ReleaseOrderItem, DistributionPlanNode


class ReleaseOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = ReleaseOrderItem
        fields = ('id', 'release_order', 'item', 'item_number', 'quantity', 'value', 'purchase_order_item', 'distributionplannode_set')


class ReleaseOrderItemViewSet(ModelViewSet):
    queryset = ReleaseOrderItem.objects.all()
    serializer_class = ReleaseOrderItemSerialiser
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('release_order',)

    def get_queryset(self):
        consignee = self.request.GET.get('consignee', None)
        if consignee and consignee != 'null':
            ro_item_ids = DistributionPlanNode.objects.filter(consignee_id=int(consignee)).values_list('item_id')
            return self.queryset.filter(id__in=ro_item_ids)
        return self.queryset

releaseOrderItemRouter = DefaultRouter()
releaseOrderItemRouter.register(r'release-order-item', ReleaseOrderItemViewSet)
