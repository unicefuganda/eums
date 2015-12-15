from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.api.standard_pagination import StandardResultsSetPagination

from eums.models import ReleaseOrder


class ReleaseOrderSerializer(serializers.ModelSerializer):
    programme = serializers.CharField(read_only=True, source='sales_order.programme.name')
    consignee_name = serializers.CharField(read_only=True, source='consignee.name')

    class Meta:
        model = ReleaseOrder
        fields = ('id', 'order_number', 'sales_order', 'purchase_order', 'programme', 'consignee', 'waybill',
                  'delivery_date', 'items', 'delivery', 'consignee_name', 'track', 'tracked_date')


class ReleaseOrderViewSet(ModelViewSet):
    queryset = ReleaseOrder.objects.all().order_by('order_number')
    serializer_class = ReleaseOrderSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        if request.GET.get('paginate', None) != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.__get_release_orders(request))
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
        return self._apply_filters_on(orders, request)

    def _apply_filters_on(self, orders, request):
        query = request.GET.get('query')
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')

        if query:
            orders = orders.filter(waybill__icontains=query)
        if from_date:
            orders = orders.filter(delivery_date__gte=from_date)
        if to_date:
            orders = orders.filter(delivery_date__lte=to_date)
        return orders

    def get_queryset(self):
        delivery_is_null = self.request.GET.get('delivery__isnull', None)
        if delivery_is_null == 'true':
            return self.queryset.filter(delivery__isnull=True)
        if delivery_is_null == 'false':
            return self.queryset.filter(delivery__isnull=False)
        return self.queryset._clone()

releaseOrderRouter = DefaultRouter()
releaseOrderRouter.register(r'release-order', ReleaseOrderViewSet)