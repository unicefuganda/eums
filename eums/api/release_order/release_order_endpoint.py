from django.db.models import Count
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.api.filter.filter_mixin import RequestFilterMixin
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import ReleaseOrder
from eums.permissions.view_release_order_permission import ViewReleaseOrderPermission


class ReleaseOrderSerializer(serializers.ModelSerializer):
    programme = serializers.CharField(read_only=True, source='sales_order.programme.name')
    consignee_name = serializers.CharField(read_only=True, source='consignee.name')

    class Meta:
        model = ReleaseOrder
        fields = ('id', 'order_number', 'sales_order', 'purchase_order', 'programme', 'consignee', 'waybill',
                  'delivery_date', 'items', 'delivery', 'consignee_name', 'track', 'tracked_date')


class ReleaseOrderViewSet(ModelViewSet, RequestFilterMixin):
    permission_classes = (ViewReleaseOrderPermission,)
    queryset = ReleaseOrder.objects.all().order_by('order_number')
    serializer_class = ReleaseOrderSerializer
    pagination_class = StandardResultsSetPagination
    supported_filters = {
        'waybill': 'waybill__icontains',
        'programmeId': 'sales_order__programme_id',
        'itemDescription': 'items__item__description__contains',
        'selectedLocation': 'items__distributionplannode__location__contains',
        'fromDate': 'delivery_date__gte',
        'toDate': 'delivery_date__lte',
        'ipId': 'items__distributionplannode__ip_id',
    }

    def list(self, request, *args, **kwargs):

        if request.GET.get('paginate', None) != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.__get_release_orders(request))
        if request.GET.get('field'):
            field_map = {'trackedDate': 'tracked_date',
                         'deliveryDate': 'delivery_date',
                         'orderNumber': 'waybill'}
            field = field_map[request.GET.get('field')]
            sort_field = '-' + field if request.GET.get('order') == 'desc' else field
            null_date_setting = '-null_date' if ('-' in sort_field) else 'null_date'
            queryset = queryset.annotate(null_date=Count(field)).order_by(null_date_setting, sort_field)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(self.get_serializer(queryset, many=True).data)

    def __get_release_orders(self, request):
        consignee_id = request.GET.get('consignee', None)
        delivered = request.GET.get('delivered', None)
        if consignee_id:
            orders = ReleaseOrder.objects.for_consignee(consignee_id).order_by('waybill')
        else:
            if delivered:
                orders = ReleaseOrder.objects.delivered().order_by('waybill')
            else:
                orders = self.get_queryset()
        return orders.filter(**(self.build_filters(request.query_params)))

    def get_queryset(self):
        delivery_is_null = self.request.GET.get('delivery__isnull', None)
        if delivery_is_null == 'true':
            return self.queryset.filter(delivery__isnull=True)
        if delivery_is_null == 'false':
            return self.queryset.filter(delivery__isnull=False)
        return self.queryset._clone()

    def sort_by(self, queryset, request):
        return queryset.order_by('delivery_date')


releaseOrderRouter = DefaultRouter()
releaseOrderRouter.register(r'release-order', ReleaseOrderViewSet)
