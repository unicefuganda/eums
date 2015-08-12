from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.api.distribution_plan_node.distribution_plan_node_endpoint import DistributionPlanNodeSerialiser
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import ConsigneeItem, UserProfile, DistributionPlanNode


class ConsigneeItemSerialiser(serializers.ModelSerializer):
    item_description = serializers.CharField(source='item.description', read_only=True)

    class Meta:
        model = ConsigneeItem
        fields = ('id', 'consignee', 'item', 'amount_received', 'available_balance', 'deliveries', 'item_description')


class ConsigneeItemViewSet(ModelViewSet):
    queryset = ConsigneeItem.objects.all()
    serializer_class = ConsigneeItemSerialiser
    pagination_class = StandardResultsSetPagination
    search_fields = ('item__description',)

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            return ConsigneeItem.objects.filter(consignee=user_profile.consignee)
        return super(ConsigneeItemViewSet, self).get_queryset()

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(ConsigneeItemViewSet, self).list(request, *args, **kwargs)

    @detail_route()
    def deliveries(self, *_, **kwargs):
        consignee_item = ConsigneeItem.objects.get(pk=kwargs['pk'])
        deliveries_by_consignee = DistributionPlanNode.objects.delivered_by_consignee(consignee_item.consignee,
                                                                                      consignee_item.item)
        page = self.paginate_queryset(deliveries_by_consignee)
        delivery_node_serialiser = DistributionPlanNodeSerialiser(page, many=True)
        return self.get_paginated_response(delivery_node_serialiser.data)


consignee_items_router = DefaultRouter()
consignee_items_router.register(r'consignee-item', ConsigneeItemViewSet)
