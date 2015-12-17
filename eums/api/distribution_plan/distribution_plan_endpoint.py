from django.db.models import Q
from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.permissions.view_delivery_permission import ViewDeliveryPermission
from eums.models import DistributionPlan, UserProfile, SystemSettings, ReleaseOrderItem
from eums.services.flow_scheduler import schedule_run_directly_for


class DistributionPlanSerializer(serializers.ModelSerializer):
    distributionplannode_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = DistributionPlan
        fields = ('id', 'programme', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark', 'total_value', 'is_received', 'type', 'number',
                  'number_of_items', 'confirmed', 'shipment_received', 'is_retriggered',
                  'time_limitation_on_distribution', 'tracked_date')


class DistributionPlanViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ViewDeliveryPermission)

    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerializer

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

        query = request.GET.get('query')
        programme = request.GET.get('programme')
        user_profile, consignee = self.get_user_profile(logged_in_user)
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        if user_profile and consignee:
            deliveries = DistributionPlanViewSet._deliveries_for_ip(programme, query, consignee, from_date, to_date)
            filtered_deliveries = filter(
                    lambda x: x.is_partially_received() is None or x.is_partially_received() or x.is_retriggered,
                    deliveries)
            return Response(self.get_serializer(filtered_deliveries, many=True).data)

        admin_deliveries = DistributionPlanViewSet._deliveries_for_admin(programme, query, from_date, to_date)
        return Response(self.get_serializer(admin_deliveries, many=True).data)

    @staticmethod
    def get_user_profile(logged_in_user):
        try:
            user_profile = UserProfile.objects.get(user=logged_in_user)
            consignee = user_profile.consignee
            return user_profile, consignee
        except StandardError:
            return None, None

    @staticmethod
    def _deliveries_for_admin(programme, query, from_date, to_date):
        filter_args = {}
        DistributionPlanViewSet.__add_programme_filter_if_exist(filter_args, programme)

        if from_date and to_date:
            filter_args['delivery_date__range'] = [from_date, to_date]

        deliveries = DistributionPlan.objects.filter(**filter_args) if len(
                filter_args) > 0 else DistributionPlan.objects.all()

        return DistributionPlanViewSet.__filter_deliveries_by_query(query, deliveries)

    @staticmethod
    def _deliveries_for_ip(programme, query, consignee, from_date, to_date):
        filtered_distribution_plans = DistributionPlanViewSet.__filter_distribution_plans_depends_on_auto_track()

        filter_args = {
            'consignee': consignee
        }
        DistributionPlanViewSet.__add_programme_filter_if_exist(filter_args, programme)

        if from_date and to_date:
            filter_args['delivery_date__range'] = [from_date, to_date]
        elif from_date:
            filter_args['delivery_date__gte'] = from_date
        elif to_date:
            filter_args['delivery_date__lte'] = to_date

        return DistributionPlanViewSet.__filter_deliveries_by_query(query,
                                                                    filtered_distribution_plans.filter(**filter_args))

    @staticmethod
    def __filter_distribution_plans_depends_on_auto_track():
        if SystemSettings.objects.first().auto_track:
            return DistributionPlan.objects.filter(
                    Q(distributionplannode__item__polymorphic_ctype=ReleaseOrderItem.TYPE_CODE) | Q(
                            track=True)).distinct()

        return DistributionPlan.objects.filter(Q(track=True))

    @staticmethod
    def __add_programme_filter_if_exist(filter_args, programme):
        if programme is not None:
            filter_args['programme__name__icontains'] = programme

    @staticmethod
    def __filter_deliveries_by_query(query, deliveries):
        return filter(lambda delivery: query in str(delivery.number()), deliveries) if query else deliveries


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)
