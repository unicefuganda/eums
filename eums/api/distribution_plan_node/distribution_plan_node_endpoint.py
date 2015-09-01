from eums.api.standard_pagination import StandardResultsSetPagination
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanNode as DeliveryNode, UserProfile


class DistributionPlanNodeSerialiser(serializers.ModelSerializer):
    quantity = serializers.IntegerField(write_only=True, required=False)
    parents = serializers.ListField(required=False)
    balance = serializers.IntegerField(read_only=True, required=False)
    consignee_name = serializers.CharField(read_only=True, source='consignee.name')
    item_description = serializers.CharField(read_only=True, source='item.item.description')
    order_type = serializers.CharField(read_only=True, source='type')

    class Meta:
        model = DeliveryNode
        fields = ('id', 'distribution_plan', 'location', 'consignee', 'tree_position', 'parents', 'quantity_in',
                  'contact_person_id', 'item', 'delivery_date', 'remark', 'track', 'quantity', 'quantity_out',
                  'balance', 'has_children', 'consignee_name', 'item_description', 'order_number', 'order_type')


class DistributionPlanNodeViewSet(ModelViewSet):
    queryset = DeliveryNode.objects.all()
    serializer_class = DistributionPlanNodeSerialiser
    pagination_class = StandardResultsSetPagination
    search_fields = ('location', 'consignee__name', 'delivery_date')
    filter_fields = ('consignee', 'item', 'distribution_plan', 'contact_person_id', 'item__item')

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            item_id = self.request.GET.get('consignee_deliveries_for_item')
            if item_id:
                return DeliveryNode.objects.delivered_by_consignee(user_profile.consignee, item_id).order_by('-id')
            return self._all_nodes_delivered_to_consignee(user_profile)
        return self.queryset._clone()

    def _all_nodes_delivered_to_consignee(self, user_profile):
        queryset = DeliveryNode.objects.filter(consignee=user_profile.consignee)
        if self.request.GET.get('is_distributable'):
            return queryset.filter(balance__gt=0, distribution_plan__confirmed=True)
        return queryset

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(DistributionPlanNodeViewSet, self).list(request, *args, **kwargs)

distributionPlanNodeRouter = DefaultRouter()
distributionPlanNodeRouter.register(r'distribution-plan-node', DistributionPlanNodeViewSet)
