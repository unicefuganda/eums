from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Item


class ItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'description', 'unit', 'material_code')


class ItemViewSet(ModelViewSet):
    queryset = Item.objects.all().order_by('description')
    serializer_class = ItemSerialiser


itemRouter = DefaultRouter()
itemRouter.register(r'item', ItemViewSet)
