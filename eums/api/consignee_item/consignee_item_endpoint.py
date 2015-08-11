from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.models import ConsigneeItem


class ConsigneeItemSerialiser(serializers.ModelSerializer):
    consignee = serializers.PrimaryKeyRelatedField(read_only=True)
    item = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ConsigneeItem
        fields = ('id', 'consignee', 'item', 'amount_received', 'amount_distributed', 'deliveries')


class ConsigneeItemViewSet(ModelViewSet):
    queryset = ConsigneeItem.objects.all()
    serializer_class = ConsigneeItemSerialiser

consignee_items_router = DefaultRouter()
consignee_items_router.register(r'consignee-item', ConsigneeItemViewSet)