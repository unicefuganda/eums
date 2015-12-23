import logging

from django.db.models import Q
from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.api.filter.filter_mixin import RequestFilterMixin
from eums.permissions.view_delivery_permission import ViewDeliveryPermission
from eums.models import DistributionPlan, UserProfile, SystemSettings, ReleaseOrderItem
from eums.services.flow_scheduler import schedule_run_directly_for

logger = logging.getLogger(__name__)


class DistributionPlanSerializer(serializers.ModelSerializer):
    distributionplannode_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark', 'total_value', 'is_received', 'type', 'number',
                  'number_of_items', 'confirmed', 'shipment_received', 'is_retriggered',
                  'time_limitation_on_distribution', 'tracked_date')


class DistributionPlanViewSet(ModelViewSet, RequestFilterMixin):
    permission_classes = (DjangoModelPermissions, ViewDeliveryPermission)

    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerializer

    supported_filters = {
        'programme': 'programme__name__icontains',
        'query': 'distributionplannode__item__purchaseorderitem__purchase_order__order_number__icontains',
        'from': 'delivery_date__gte',
        'to': 'delivery_date__lte',
        'consignee': 'consignee'
    }

    @detail_route(['GET', ])
    def answers(self, request, *args, **kwargs):
        delivery = DistributionPlan.objects.get(pk=(kwargs['pk']))
        return Response(delivery.answers())

    @detail_route(['GET', ])
    def node_answers(self, request, *args, **kwargs):
        delivery = DistributionPlan.objects.get(pk=(kwargs['pk']))
        return Response(delivery.node_answers())

    @detail_route(['PATCH', ])
    def retrigger_delivery(self, request, *args, **kwargs):
        delivery = DistributionPlan.objects.get(pk=(kwargs['pk']))
        delivery.is_retriggered = True
        delivery.save()
        schedule_run_directly_for(delivery, 0)
        return Response()

    def list(self, request, *args, **kwargs):
        logged_in_user = request.user
        user_profile, consignee = self.get_user_profile(logged_in_user)

        if user_profile and consignee:
            deliveries = self._deliveries_for_ip(request, consignee)

            filtered_deliveries = filter(
                    lambda x: x.is_partially_received() is None or x.is_partially_received() or x.is_retriggered,
                    deliveries)
            return Response(self.get_serializer(filtered_deliveries, many=True).data)

        admin_deliveries = self._deliveries_for_admin(request)
        return Response(self.get_serializer(admin_deliveries, many=True).data)

    @staticmethod
    def get_user_profile(logged_in_user):
        try:
            user_profile = UserProfile.objects.get(user=logged_in_user)
            consignee = user_profile.consignee
            return user_profile, consignee
        except:
            return None, None

    def _deliveries_for_admin(self, request):
        return DistributionPlan.objects.filter(**self.build_filters(request.query_params)).distinct()

    def _deliveries_for_ip(self, request, consignee):
        filtered_distribution_plans = DistributionPlanViewSet.__filter_distribution_plans_depends_on_auto_track()

        filters = self.build_filters(request.query_params, **{'consignee': consignee})
        return filtered_distribution_plans.filter(**filters).distinct()

    @staticmethod
    def __filter_distribution_plans_depends_on_auto_track():
        if SystemSettings.objects.first().auto_track:
            return DistributionPlan.objects.filter(
                    Q(distributionplannode__item__polymorphic_ctype=ReleaseOrderItem.TYPE_CODE) | Q(
                            track=True)).distinct()

        return DistributionPlan.objects.filter(Q(track=True))


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)
