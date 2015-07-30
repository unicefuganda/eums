from eums.api.consignee.delivery_attached_permission import DeliveryAttachedPermission
from eums.api.consignee.vision_imported_permission import VisionImportedPermission
from eums.api.consignee.created_by_permission import CreatedByPermission
from rest_framework import serializers
from rest_framework.decorators import detail_route
from rest_framework.pagination import PageNumberPagination
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import DjangoModelPermissions
from eums.models import Consignee, DistributionPlanNode


class ConsigneeSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ('id', 'name', 'type', 'imported_from_vision', 'customer_id', 'location', 'remarks')


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10


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

    def get_queryset(self):
        if self.request.GET.get('node') == 'top':
            consignee_ids = DistributionPlanNode.objects.filter(parent=None).values_list('consignee')
            return self.queryset.filter(id__in=consignee_ids)
        return self.queryset._clone()

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


consigneeRouter = DefaultRouter()
consigneeRouter.register(r'consignee', ConsigneeViewSet)
