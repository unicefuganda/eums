from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Consignee, DistributionPlanNode

TOPLEVEL = 'top'


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type')


class ConsigneeViewSet(ModelViewSet):
    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    filter_backends = (filters.SearchFilter,)
    search_fields = ('type',)

    def list(self, request, *args, **kwargs):
        if request.GET.get('node') == TOPLEVEL:
            consignee_ids = DistributionPlanNode.objects.filter(parent=None).values_list('consignee', flat=True)
            self.queryset = Consignee.objects.filter(id__in=consignee_ids)
        return super(ConsigneeViewSet, self).list(request, *args, **kwargs)


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
