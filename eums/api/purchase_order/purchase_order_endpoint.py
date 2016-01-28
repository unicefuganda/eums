from django.db.models import Count
from rest_framework import serializers
from rest_framework.decorators import list_route, detail_route
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.api.distribution_plan.distribution_plan_endpoint import DistributionPlanSerializer
from eums.api.filter.filter_mixin import RequestFilterMixin
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import PurchaseOrder
from eums.permissions.view_purchase_order_permission import ViewPurchaseOrderPermission


class PurchaseOrderSerialiser(serializers.ModelSerializer):
    programme_name = serializers.CharField(read_only=True, source='sales_order.programme.name')
    programme = serializers.IntegerField(read_only=True, source='sales_order.programme.id')

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'order_number', 'date', 'sales_order', 'po_type', 'programme_name', 'purchaseorderitem_set',
                  'release_orders', 'programme', 'is_single_ip', 'has_plan', 'is_fully_delivered', 'track',
                  'tracked_date', 'last_shipment_date')


class PurchaseOrderViewSet(ModelViewSet, RequestFilterMixin):

    permission_classes = (DjangoModelPermissions, ViewPurchaseOrderPermission)

    queryset = PurchaseOrder.objects.all().order_by('order_number')
    serializer_class = PurchaseOrderSerialiser
    pagination_class = StandardResultsSetPagination
    supported_filters = {
        'purchaseOrder': 'order_number__icontains',
        'programmeId': 'sales_order__programme_id',
        'itemDescription': 'purchaseorderitem__item__description__icontains',
        'selectedLocation': 'purchaseorderitem__distributionplannode__location__icontains',
        'fromDate': 'last_shipment_date__gte',
        'toDate': 'last_shipment_date__lte',
        'ipId': 'purchaseorderitem__distributionplannode__ip_id',
    }

    # todo: below list should be removed, or merged to for_direct_delivery
    def list(self, request, *args, **kwargs):
        consignee_id = request.GET.get('consignee', None)
        if consignee_id:
            orders = PurchaseOrder.objects.for_consignee(consignee_id).order_by('order_number')
        else:
            orders = self.get_queryset()
        return Response(self.get_serializer(orders, many=True).data)

    @list_route()
    def for_direct_delivery(self, request, *args, **kwargs):
        if request.GET.get('paginate', None) != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.__get_direct_delivery(request))

        if request.GET.get('field'):
            field_map = {'orderNumber': 'order_number',
                         'date': 'date',
                         'trackedDate': 'tracked_date',
                         'lastShipmentDate': 'last_shipment_date',
                         'poType': 'po_type',
                         'programmeName': 'programme_name'}
            field = field_map[request.GET.get('field')]
            sort_field = '-' + field if request.GET.get('order') == 'desc' else field
            null_date_setting = '-null_date' if sort_field.__contains__('-') else 'null_date'
            queryset = queryset.annotate(null_date=Count(field)).order_by(null_date_setting, sort_field)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @detail_route()
    def deliveries(self, request, pk=None):
        is_root = request.GET.get('is_root')
        purchase_order = self.get_object()
        deliveries = purchase_order.deliveries(is_root)
        return Response(DistributionPlanSerializer(deliveries, many=True).data)

    @detail_route()
    def total_value(self, _, pk=None):
        return Response(self.get_object().total_value())

    def __get_direct_delivery(self, request):
        po_orders = PurchaseOrder.objects.annotate(release_order_count=Count('release_orders'))
        no_release_orders = po_orders.filter(release_order_count=0)
        return no_release_orders.filter(**(self.build_filters(request.query_params)))


purchaseOrderRouter = DefaultRouter()
purchaseOrderRouter.register(r'purchase-order', PurchaseOrderViewSet)
