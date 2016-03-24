from django.db.models import Q, Max
from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Alert
from eums.permissions.alert_permissions import AlertPermissions
from eums.services.alert_service import get_queryset


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = (
            'id',
            'order_type',
            'order_number',
            'issue',
            'is_resolved',
            'remarks',
            'consignee_name',
            'contact',
            'created_on',
            'issue_display_name',
            'item_description',
            'total_value',
            'quantity_delivered',
            'location',
            'date_shipped',
            'date_received',
            'runnable_id',
            'is_retriggered'
        )


class AlertViewSet(ReadOnlyModelViewSet):
    permission_classes = (DjangoModelPermissions, AlertPermissions)
    pagination_class = StandardResultsSetPagination
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

    def get_queryset(self):
        type = self.request.GET.get('type', None)
        po_waybill = self.request.GET.get('po_waybill', None)

        return get_queryset(type, po_waybill)


    def patch(self, request, *args, **kwargs):
        try:
            data = request.data
            alert = Alert.objects.get(pk=kwargs['pk'])
            alert.remarks = data['remarks'].strip()
            alert.is_resolved = data['is_resolved']
            alert.save()
            return Response()
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def _is_unicef_viewer(logged_in_user):
        try:
            is_unicef_viewer = logged_in_user.groups.first().name in ['UNICEF_viewer']
        except:
            is_unicef_viewer = False
        return is_unicef_viewer

    def list(self, request, *args, **kwargs):
        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.get_queryset())

        if request.GET.get('field'):
            sort_order = request.GET.get('order')
            field_handlers = {
                'alertDate': CommonFieldSorter(self.generate_paged_response, 'created_on', sort_order),
                'status': CommonFieldSorter(self.generate_paged_response, 'issue', sort_order),
                'dateShipped': RelatedFieldSorter(self.generate_paged_response, 'date_shipped', sort_order,
                                                  'runnable__delivery_date'),
                'value': RelatedFieldSorter(self.generate_paged_response, 'total_value', sort_order,
                                            'runnable__total_value'),
                'dateReceived': PropertySorter(self.generate_paged_response, 'date_received', sort_order)
            }
            return field_handlers.get(request.GET.get('field')).query(queryset)

        return self.generate_paged_response(queryset)

    def generate_paged_response(self, queryset):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CommonFieldSorter(object):
    def __init__(self, method, field_name, order):
        self.field_name = field_name
        self.order = order
        self.process_method = method

    @property
    def _sort_field(self):
        return ('-' + self.field_name) if self.order == 'desc' else self.field_name

    def query(self, queryset):
        return self.process_method(queryset.order_by(self._sort_field))


class RelatedFieldSorter(CommonFieldSorter):
    def __init__(self, method, field_name, order, related_field):
        super(RelatedFieldSorter, self).__init__(method, field_name, order)
        self.related_field = related_field

    def query(self, queryset):
        return self.process_method(
                queryset.annotate(**{self.field_name: Max(self.related_field)}).order_by(self._sort_field))


class PropertySorter(CommonFieldSorter):
    def query(self, queryset):
        reverse_flag = True if self.order == 'desc' else False
        alerts = list(queryset)
        alerts = sorted(alerts,
                        key=lambda alert: getattr(alert, self.field_name, 'Z') if not reverse_flag else 'Z',
                        reverse=reverse_flag)
        return self.process_method(alerts)


alert_router = DefaultRouter()
alert_router.register(r'alert', AlertViewSet)


class AlertCount(APIView):
    def get(self, request, *args, **kwargs):
        total_count = Alert.objects.count()
        unresolved = Alert.objects.filter(is_resolved=False).count()
        result = {'total': total_count, 'unresolved': unresolved}
        return Response(result, status=status.HTTP_200_OK)
