from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.permissions.view_delivery_permission import ViewDeliveryPermission
from eums.models import DistributionPlan, UserProfile


class DistributionPlanSerialiser(serializers.ModelSerializer):
    distributionplannode_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'date', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark', 'total_value', 'is_received', 'type')


class DistributionPlanViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ViewDeliveryPermission)

    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerialiser
    filter_fields = ('programme',)

    def list(self, request, *args, **kwargs):
        logged_in_user = request.user

        try:
            user_profile = UserProfile.objects.get(user=logged_in_user)
            if user_profile and user_profile.consignee:
                deliveries = DistributionPlan.objects.filter(consignee=user_profile.consignee)
                return Response(self.get_serializer(deliveries, many=True).data)
        except:
            return super(DistributionPlanViewSet, self).list(request, *args, **kwargs)


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)
