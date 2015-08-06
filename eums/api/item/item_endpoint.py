from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.api.standard_pagination import StandardResultsSetPagination

from eums.models import Item, UserProfile


class ItemSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'description', 'unit', 'material_code')


class ItemViewSet(ModelViewSet):
    queryset = Item.objects.all().order_by('description')
    serializer_class = ItemSerialiser
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user_profile = UserProfile.objects.filter(user_id=self.request.user.id).first()
        if user_profile:
            return Item.objects.delivered_to_consignee(user_profile.consignee)
        return super(ItemViewSet, self).get_queryset()

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(ItemViewSet, self).list(request, args, kwargs)


itemRouter = DefaultRouter()
itemRouter.register(r'item', ItemViewSet)
