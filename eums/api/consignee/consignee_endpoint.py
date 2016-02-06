from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.status import *
from rest_framework.permissions import DjangoModelPermissions
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Consignee, DistributionPlanNode, UserProfile
from eums.permissions.consignee_permissions import ConsigneePermissions
from eums.auth import *
from model_utils import Choices


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location', 'remarks', 'created_by_user')


ITEM_PERMISSIONS = Choices('can_edit_fully', 'can_edit_remarks', 'can_edit_location_and_remarks', 'consignee_forbidden')


class ConsigneeViewSet(ModelViewSet):
    permission_classes = (
        DjangoModelPermissions,
        ConsigneePermissions
    )

    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    search_fields = ('customer_id', 'name', 'location', 'remarks')
    filter_fields = ('imported_from_vision',)
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(ConsigneeViewSet, self).list(request, args, kwargs)

    def perform_create(self, serializer):
        serializer.save(created_by_user=self.request.user)

    @detail_route()
    def deliveries(self, _, pk=None):
        node_ids = DistributionPlanNode.objects.filter(consignee_id=pk).values_list('id', flat=True)
        return Response(list(node_ids))

    @detail_route()
    def permission_to_edit(self, request, pk=None):
        if request.user.groups.first() is None:
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.can_edit_fully})
        consignee = self.get_object()
        if consignee.imported_from_vision:
            return self.vision_import_edit_permissions(request)
        if request.user.groups.first().name in [GROUP_UNICEF_ADMIN, GROUP_UNICEF_EDITOR]:
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.can_edit_fully})
        return self.ip_edit_permissions(consignee, request)

    @staticmethod
    def vision_import_edit_permissions(request):
        if request.user.groups.first().name in [GROUP_UNICEF_ADMIN, GROUP_UNICEF_EDITOR]:
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.can_edit_location_and_remarks})
        if request.user.groups.first().name in [GROUP_IP_EDITOR]:
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.can_edit_remarks})
        return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.consignee_forbidden})

    @staticmethod
    def ip_edit_permissions(consignee, request):
        try:
            request_user = UserProfile.objects.get(user=request.user)
            created_by_user = UserProfile.objects.filter(user=consignee.created_by_user).first()
            if created_by_user is None \
                    or created_by_user.consignee != request_user.consignee \
                    or created_by_user.user_id != request_user.user_id:
                return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.consignee_forbidden})
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.can_edit_fully})
        except:
            return Response(status=HTTP_200_OK, data={'permission': ITEM_PERMISSIONS.consignee_forbidden})


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
