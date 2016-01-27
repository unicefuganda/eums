from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Alert, UserProfile, DistributionPlanNode, DistributionPlan
from django.db.models import Q, Count, Max

from eums.permissions.alert_permissions import AlertPermissions


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
            'contact_name',
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
        if type == 'item':
            return Alert.objects.filter(
                    runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlanNode))
        elif type == 'delivery':
            return Alert.objects.filter(
                    Q(runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlan))
                    , ~Q(issue=Alert.ISSUE_TYPES.distribution_expired))
        elif type == 'distribution':
            return Alert.objects.filter(
                    Q(runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlan)),
                    Q(issue=Alert.ISSUE_TYPES.distribution_expired))
        else:
            return self.queryset._clone()

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
        logged_in_user = request.user

        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0

        queryset = self.filter_queryset(self.get_queryset())

        if request.GET.get('field'):
            sort_order = request.GET.get('order')
            field_handlers = {
                'alertDate': CommonFieldSorter('created_on', sort_order),
                'status': CommonFieldSorter('issue', sort_order),
                'dateShipped': RelatedFieldSorter('date_shipped', sort_order, 'runnable__delivery_date'),
                'value': RelatedFieldSorter('total_value', sort_order, 'runnable__total_value'),
                'dateReceived': PropertySorter('date_received', sort_order)
            }
            queryset = field_handlers.get(request.GET.get('field')).query(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)


class CommonFieldSorter(object):
    def __init__(self, field_name, order):
        self.field_name = field_name
        self.order = order

    @property
    def _sort_field(self):
        return ('-' + self.field_name) if self.order == 'desc' else self.field_name

    def query(self, queryset):
        return queryset.order_by(self._sort_field)


class RelatedFieldSorter(CommonFieldSorter):
    def __init__(self, field_name, order, related_field):
        super(RelatedFieldSorter, self).__init__(field_name, order)
        self.related_field = related_field

    def query(self, queryset):
        return queryset.annotate(**{self.field_name: Max(self.related_field)}).order_by(self._sort_field)


class PropertySorter(CommonFieldSorter):
    def query(self, queryset):
        return queryset


alert_router = DefaultRouter()
alert_router.register(r'alert', AlertViewSet)


class AlertCount(APIView):
    def get(self, request, *args, **kwargs):
        total_count = Alert.objects.count()
        unresolved = Alert.objects.filter(is_resolved=False).count()
        result = {'total': total_count, 'unresolved': unresolved}
        return Response(result, status=status.HTTP_200_OK)
