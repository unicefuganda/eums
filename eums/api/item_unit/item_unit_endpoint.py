from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import ItemUnit


class ItemUnitSerialiser(serializers.ModelSerializer):
    class Meta:
        model = ItemUnit
        fields = ('id', 'name')


class ItemUnitViewSet(ModelViewSet):
    queryset = ItemUnit.objects.all()
    serializer_class = ItemUnitSerialiser


itemUnitRouter = DefaultRouter()
itemUnitRouter.register(r'item-unit', ItemUnitViewSet)