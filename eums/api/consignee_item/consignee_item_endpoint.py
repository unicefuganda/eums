from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import ConsigneeItem, UserProfile


class ConsigneeItemSerialiser(serializers.ModelSerializer):
    item_description = serializers.CharField(source='item.description', read_only=True)

    class Meta:
        model = ConsigneeItem
        fields = ('id', 'consignee', 'item', 'amount_received', 'available_balance', 'deliveries', 'item_description')


class ConsigneeItemViewSet(ModelViewSet):
    queryset = ConsigneeItem.objects.all()
    serializer_class = ConsigneeItemSerialiser
    pagination_class = StandardResultsSetPagination
    filter_fields = ('item',)
    search_fields = ('item__description',)

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            return ConsigneeItem.objects.filter(consignee=user_profile.consignee)
        return super(ConsigneeItemViewSet, self).get_queryset()


consignee_items_router = DefaultRouter()
consignee_items_router.register(r'consignee-item', ConsigneeItemViewSet)
