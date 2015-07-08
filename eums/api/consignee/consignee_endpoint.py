from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Consignee, DistributionPlanNode


class ConsigneeSerialiser(serializers.ModelSerializer):
    customer_id = serializers.CharField(default='', required=False)
    imported_from_vision = serializers.BooleanField(required=False)

    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location')


class ConsigneeViewSet(ModelViewSet):
    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    filter_backends = (filters.SearchFilter,)
    search_fields = ('type',)

    def get_queryset(self):
        if self.request.GET.get('node') == 'top':
            consignee_ids = DistributionPlanNode.objects.filter(parent=None).values_list('consignee')
            return self.queryset.filter(id__in=consignee_ids)
        return self.queryset

consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
