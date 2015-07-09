from rest_framework import filters
from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from eums.models import Consignee, DistributionPlanNode


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location', 'remarks')


class ConsigneeViewSet(ModelViewSet):
    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    filter_backends = (filters.SearchFilter,)
    search_fields = ('type',)

    def get_queryset(self):
        if self.request.GET.get('node') == 'top':
            consignee_ids = DistributionPlanNode.objects.filter(parent=None).values_list('consignee')
            return self.queryset.filter(id__in=consignee_ids)
        return self.queryset._clone()

    @detail_route()
    def deliveries(self, _, pk=None):
        node_ids = DistributionPlanNode.objects.filter(consignee_id=pk).values_list('id', flat=True)
        return Response(list(node_ids))

consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
