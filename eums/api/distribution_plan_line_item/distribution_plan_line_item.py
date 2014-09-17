from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.models import DistributionPlanLineItem


class DistributionPlanLineItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = DistributionPlanLineItem
        fields = (
            'id', 'item', 'quantity', 'under_current_supply_plan', 'planned_distribution_date',
            'consignee', 'destination_location', 'remark'
        )


class DistributionPlanLineItemViewSet(ModelViewSet):
    queryset = DistributionPlanLineItem.objects.all()
    serializer_class = DistributionPlanLineItemSerialiser


distributionPlanLineItemRouter = DefaultRouter()
distributionPlanLineItemRouter.register(r'distribution-plan-line-item', DistributionPlanLineItemViewSet)