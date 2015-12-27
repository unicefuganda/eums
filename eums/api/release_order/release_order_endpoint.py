from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
import unicodedata

from eums.api.filter.filter_mixin import RequestFilterMixin
from eums.api.standard_pagination import StandardResultsSetPagination

from eums.models import ReleaseOrder

class ReleaseOrderSerializer(serializers.ModelSerializer):
    programme = serializers.CharField(read_only=True, source='sales_order.programme.name')
    consignee_name = serializers.CharField(read_only=True, source='consignee.name')

    class Meta:
        model = ReleaseOrder
        fields = ('id', 'order_number', 'sales_order', 'purchase_order', 'programme', 'consignee', 'waybill',
                  'delivery_date', 'items', 'delivery', 'consignee_name', 'track', 'tracked_date')


class ReleaseOrderViewSet(ModelViewSet, RequestFilterMixin):
    queryset = ReleaseOrder.objects.all().order_by('order_number')
    serializer_class = ReleaseOrderSerializer
    pagination_class = StandardResultsSetPagination
    supported_filters = {
        'query': 'waybill__icontains',
        'from': 'delivery_date__gte',
        'to': 'delivery_date__lte'
    }

    def list(self, request, *args, **kwargs):

        if request.GET.get('paginate', None) != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.__get_release_orders(request))
        if request.GET.get('field') :
            sort_field = unicodedata.normalize('NFKD',request.GET.get('field')).encode('ascii','ignore')
            map = {'trackedDate': 'tracked_date',
                   'deliveryDate': 'delivery_date',
                   'orderNumber': 'waybill'}

            sort_field = '-' + map[sort_field] if request.GET.get('order') == 'desc' else map[sort_field]
            queryset = queryset.order_by(sort_field)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            release = self.get_paginated_response(serializer.data)
            return release

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