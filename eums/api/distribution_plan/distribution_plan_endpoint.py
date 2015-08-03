from eums.permissions.view_delivery_permission import ViewDeliveryPermission
from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlan


class DistributionPlanSerialiser(serializers.ModelSerializer):
    distributionplannode_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'date', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark', 'total_value')


class DistributionPlanViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ViewDeliveryPermission)

    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerialiser


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)