from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import PurchaseOrderItem, DistributionPlanNode


class PurchaseOrderItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ('id', 'purchase_order', 'item_number', 'quantity', 'value', 'sales_order_item', 'item', 'distributionplannode_set')


class PurchaseOrderItemViewSet(ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerialiser
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('purchase_order',)

    def get_queryset(self):
        consignee = self.request.GET.get('consignee', None)
        if consignee and consignee != 'null':
            po_item_ids = DistributionPlanNode.objects.filter(consignee_id=int(consignee)).values_list('item_id')
            return self.queryset.filter(id__in=po_item_ids)
        return self.queryset

purchaseOrderItemRouter = DefaultRouter()
purchaseOrderItemRouter.register(r'purchase-order-item', PurchaseOrderItemViewSet)
