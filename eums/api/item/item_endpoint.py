from rest_framework import serializers
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Item, UserProfile


class ItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'description', 'unit', 'material_code')


class ItemViewSet(ModelViewSet):
    queryset = Item.objects.all().order_by('description')
    serializer_class = ItemSerialiser

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            return Item.objects.delivered_to_consignee(user_profile.consignee)
        return super(ItemViewSet, self).get_queryset()
    
itemRouter = DefaultRouter()
itemRouter.register(r'item', ItemViewSet)
