from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Consignee


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type')


class ConsigneeViewSet(ModelViewSet):
    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    filter_backends = (filters.SearchFilter,)
    search_fields = ('type',)


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
