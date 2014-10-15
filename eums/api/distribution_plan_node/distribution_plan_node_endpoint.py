from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanNode


class DistributionPlanNodeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = DistributionPlanNode
        fields = ('id', 'parent', 'distribution_plan', 'children', 'location', 'mode_of_delivery',
                  'distributionplanlineitem_set', 'consignee', 'tree_position')


class DistributionPlanNodeViewSet(ModelViewSet):
    queryset = DistributionPlanNode.objects.all()
    serializer_class = DistributionPlanNodeSerialiser


distributionPlanNodeRouter = DefaultRouter()
distributionPlanNodeRouter.register(r'distribution-plan-node', DistributionPlanNodeViewSet)