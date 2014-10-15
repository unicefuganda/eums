from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Consignee


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name')


class ConsigneeViewSet(ModelViewSet):
    queryset = Consignee.objects.all()
    serializer_class = ConsigneeSerialiser


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
