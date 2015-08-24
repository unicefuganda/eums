from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Consignee, DistributionPlanNode, UserProfile
from eums.permissions import DeliveryAttachedPermission, VisionImportedPermission, CreatedByPermission


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location', 'remarks')


class ConsigneeViewSet(ModelViewSet):
    permission_classes = (
        DjangoModelPermissions,
        VisionImportedPermission,
        DeliveryAttachedPermission,
        CreatedByPermission)

    queryset = Consignee.objects.all().order_by('name')
    serializer_class = ConsigneeSerialiser
    search_fields = ('customer_id', 'name', 'location')
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
        consignee = self.get_object()
        if consignee.imported_from_vision:
            return self.vision_import_edit_permissions(request)
        if request.user.groups.first().name in ['UNICEF_admin', 'UNICEF_editor']:
            return Response(status=200, data={'permission': 'can_edit_fully'})

        return self.ip_edit_permissions(consignee, request)

    @staticmethod
    def vision_import_edit_permissions(request):
        if request.user.groups.first().name in ['UNICEF_admin', 'UNICEF_editor']:
            return Response(status=200, data={'permission': 'can_edit_partially'})
        else:
            return Response(status=403)

    @staticmethod
    def ip_edit_permissions(consignee, request):
        request_ip = UserProfile.objects.get(user=request.user).consignee
        consignee_ip = UserProfile.objects.get(user=consignee.created_by_user).consignee
        return Response(status=403) if consignee_ip != request_ip else Response(status=200, data={'permission': 'can_edit_fully'})

consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
