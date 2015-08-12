from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanNode


class DistributionPlanNodeSerialiser(serializers.ModelSerializer):
    quantity = serializers.IntegerField(write_only=True, required=False)
    parents = serializers.ListField(required=False)

    class Meta:
        model = DistributionPlanNode
        fields = ('id', 'distribution_plan', 'location', 'consignee', 'tree_position', 'parents', 'quantity_in',
                  'contact_person_id', 'item', 'delivery_date', 'remark', 'track', 'quantity', 'quantity_out',
                  'balance', 'has_children')


class DistributionPlanNodeViewSet(ModelViewSet):
    queryset = DistributionPlanNode.objects.all()
    serializer_class = DistributionPlanNodeSerialiser
    filter_backends = (filters.DjangoFilterBackend,)
    search_fields = ('tree_position',)
    filter_fields = ('consignee', 'item', 'distribution_plan', 'contact_person_id')

distributionPlanNodeRouter = DefaultRouter()
distributionPlanNodeRouter.register(r'distribution-plan-node', DistributionPlanNodeViewSet)
