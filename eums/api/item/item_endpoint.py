from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Item
from eums.permissions.item_permissions import ItemPermissions


class ItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'description', 'unit', 'material_code')


class ItemViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, ItemPermissions)
    queryset = Item.objects.all().order_by('description')
    serializer_class = ItemSerialiser
    search_fields = ('description', 'material_code')

itemRouter = DefaultRouter()
itemRouter.register(r'item', ItemViewSet)
