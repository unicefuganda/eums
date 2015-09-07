from datetime import datetime
from rest_framework import serializers
from rest_framework.decorators import detail_route
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
        fields = ('id', 'programme', 'distributionplannode_set', 'location', 'consignee', 'delivery_date',
                  'track', 'contact_person_id', 'remark', 'total_value', 'is_received', 'type', 'number',
                  'number_of_items', 'confirmed', 'shipment_received')


class DistributionPlanViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ViewDeliveryPermission)

    queryset = DistributionPlan.objects.all()
    serializer_class = DistributionPlanSerialiser

    @detail_route(['GET', ])
    def answers(self, request, *args, **kwargs):
        delivery = DistributionPlan.objects.get(pk=(kwargs['pk']))
        return Response(delivery.answers())

    @detail_route(['GET', ])
    def node_answers(self, request, *args, **kwargs):
        delivery = DistributionPlan.objects.get(pk=(kwargs['pk']))
        return Response(delivery.node_answers())

    def list(self, request, *args, **kwargs):
        logged_in_user = request.user

        query = request.GET.get('query')
        programme = request.GET.get('programme')
        user_profile, consignee = self.get_user_profile(logged_in_user)
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        if user_profile and consignee:
            deliveries = DistributionPlanViewSet._deliveries_for_ip(programme, query, consignee, from_date, to_date)
            return Response(self.get_serializer(deliveries, many=True).data)

        admin_deliveries = DistributionPlanViewSet._deliveries_for_admin(programme, query, from_date, to_date)
        return Response(self.get_serializer(admin_deliveries, many=True).data)

    @staticmethod
    def get_user_profile(logged_in_user):
        try:
            user_profile = UserProfile.objects.get(user=logged_in_user)
            consignee = user_profile.consignee
            return user_profile, consignee
        except:
            return None, None

    @staticmethod
    def _deliveries_for_admin(programme, query, from_date, to_date):
        if from_date and to_date:
            return DistributionPlanViewSet.filter_deliveries(
                DistributionPlan.objects.filter(programme__name__icontains=programme,
                                                delivery_date__range=[from_date, to_date]
                                                ) if programme else DistributionPlan.objects.filter(
                    delivery_date__range=[from_date, to_date]), query)
        else:
            return DistributionPlanViewSet.filter_deliveries(
                DistributionPlan.objects.filter(programme__name__icontains=programme
                                                ) if programme else DistributionPlan.objects.all(), query)

    @staticmethod
    def _deliveries_for_ip(programme, query, consignee, from_date, to_date):
        if from_date and to_date:
            return DistributionPlanViewSet.filter_deliveries(
                DistributionPlan.objects.filter(
                    programme__name__icontains=programme,
                    delivery_date__range=[from_date, to_date],
                    consignee=consignee,
                    track=True
                ) if programme else DistributionPlan.objects.filter(
                    consignee=consignee,
                    track=True,
                    delivery_date__range=[from_date, to_date]),
                query)
        else:
            return DistributionPlanViewSet.filter_deliveries(
                DistributionPlan.objects.filter(
                    programme__name__icontains=programme,
                    consignee=consignee,
                    track=True
                ) if programme else DistributionPlan.objects.filter(
                    consignee=consignee,
                    track=True),
                query)

    @staticmethod
    def filter_deliveries(deliveries, query):
        return filter(lambda delivery: query in str(delivery.number()),
                      deliveries) if query else deliveries


distributionPlanRouter = DefaultRouter()
distributionPlanRouter.register(r'distribution-plan', DistributionPlanViewSet)
