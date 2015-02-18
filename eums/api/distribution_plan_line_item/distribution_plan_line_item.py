from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanLineItem


class DistributionPlanLineItemSerialiser(serializers.ModelSerializer):
    flow_triggered = serializers.Field(source='latest_run')
    class Meta:
        model = DistributionPlanLineItem
        fields = ('id', 'item', 'targeted_quantity', 'planned_distribution_date', 'distribution_plan_node', 'remark',
                  'track', 'flow_triggered')


class DistributionPlanLineItemViewSet(ModelViewSet):
    queryset = DistributionPlanLineItem.objects.all()
    serializer_class = DistributionPlanLineItemSerialiser


distributionPlanLineItemRouter = DefaultRouter()
distributionPlanLineItemRouter.register(r'distribution-plan-line-item', DistributionPlanLineItemViewSet)