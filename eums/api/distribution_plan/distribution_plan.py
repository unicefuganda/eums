from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.models import DistributionPlan, DistributionPlanLineItem


class DistributionPlanSerialiser(serializers.ModelSerializer):
    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'distributionplannode_set')


class DistributionPlanViewSet(ModelViewSet):
    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerialiser


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)