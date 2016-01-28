from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.routers import DefaultRouter
from rest_framework.status import HTTP_403_FORBIDDEN
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Consignee, DistributionPlanNode, UserProfile
from eums.permissions.consignee_permissions import ConsigneePermissions


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location', 'remarks')


class ConsigneeViewSet(ModelViewSet):
    permission_classes = (
        DjangoModelPermissions,
        ConsigneePermissions
    )

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
        if request.user.groups.first() is None:
            return Response(status=200, data={'permission': 'can_edit_fully'})

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
        return Response(status=HTTP_403_FORBIDDEN, data={'permission': 'consignee_forbidden'})

    @staticmethod
    def ip_edit_permissions(consignee, request):
        request_ip = UserProfile.objects.get(user=request.user).consignee
        created_by_user = UserProfile.objects.filter(user=consignee.created_by_user).first()
        if created_by_user is None or created_by_user.consignee != request_ip:
            return Response(status=HTTP_403_FORBIDDEN, data={'permission': 'consignee_forbidden'})

        return Response(status=200, data={'permission': 'can_edit_fully'})


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
