from rest_framework import serializers
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

    def list(self, request, *args, **kwargs):
        user_profile = UserProfile.objects.filter(user_id=request.user.id).first()
        items = self.queryset
        if user_profile:
            items = Item.objects.delivered_to_consignee(user_profile.consignee)
        return Response(self.get_serializer(items, many=True).data)

itemRouter = DefaultRouter()
itemRouter.register(r'item', ItemViewSet)
