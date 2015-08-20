from eums.api.standard_pagination import StandardResultsSetPagination
from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanNode as DeliveryNode, UserProfile


class DistributionPlanNodeSerialiser(serializers.ModelSerializer):
    quantity = serializers.IntegerField(write_only=True, required=False)
    parents = serializers.ListField(required=False)
    consignee_name = serializers.CharField(read_only=True, source='consignee.name')
    item_description = serializers.CharField(read_only=True, source='item.item.description')

    class Meta:
        model = DeliveryNode
        fields = ('id', 'distribution_plan', 'location', 'consignee', 'tree_position', 'parents', 'quantity_in',
                  'contact_person_id', 'item', 'delivery_date', 'remark', 'track', 'quantity', 'quantity_out',
                  'balance', 'has_children', 'consignee_name', 'item_description')


class DistributionPlanNodeViewSet(ModelViewSet):
    queryset = DeliveryNode.objects.all()
    serializer_class = DistributionPlanNodeSerialiser
    pagination_class = StandardResultsSetPagination
    search_fields = ('location', 'consignee__name')
    filter_fields = ('consignee', 'item', 'distribution_plan', 'contact_person_id')

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            item_id = self.request.GET.get('consignee_deliveries_for_item')
            if item_id:
                return DeliveryNode.objects.delivered_by_consignee(user_profile.consignee, item_id)
            return DeliveryNode.objects.filter(consignee=user_profile.consignee)
        return self.queryset._clone()

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(DistributionPlanNodeViewSet, self).list(request, *args, **kwargs)


distributionPlanNodeRouter = DefaultRouter()
distributionPlanNodeRouter.register(r'distribution-plan-node', DistributionPlanNodeViewSet)
