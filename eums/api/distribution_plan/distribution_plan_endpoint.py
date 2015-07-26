from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlan


class DistributionPlanSerialiser(serializers.ModelSerializer):
    distributionplannode_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'date', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark')


class DistributionPlanViewSet(ModelViewSet):
    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerialiser


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)