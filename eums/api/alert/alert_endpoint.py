from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Alert, UserProfile, DistributionPlanNode, DistributionPlan


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
            'runnable_id',
            'is_retriggered'
        )


class AlertViewSet(ReadOnlyModelViewSet):
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
                runnable__polymorphic_ctype=ContentType.objects.get_for_model(DistributionPlan))
        else:
            return self.queryset._clone()

    def patch(self, request, *args, **kwargs):
        logged_in_user = request.user
        is_unicef_viewer = AlertViewSet._is_unicef_viewer(logged_in_user)

        if UserProfile.objects.filter(user=logged_in_user).exists() or is_unicef_viewer:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        try:
            data = request.data
            remarks = data['remarks'].strip()

            if remarks:
                alert = Alert.objects.get(pk=kwargs['pk'])
                alert.remarks = remarks
                alert.is_resolved = True
                alert.save()
                return Response()
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
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

        if UserProfile.objects.filter(user=logged_in_user).exists():
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        paginate = request.GET.get('paginate', None)
        if paginate != 'true':
            self.paginator.page_size = 0
        return super(AlertViewSet, self).list(request, args, kwargs)


alert_router = DefaultRouter()
alert_router.register(r'alert', AlertViewSet)


class AlertCount(APIView):
    def get(self, request, *args, **kwargs):
        total_count = Alert.objects.count()
        unresolved = Alert.objects.filter(is_resolved=False).count()
        result = {'total': total_count, 'unresolved': unresolved}
        return Response(result, status=status.HTTP_200_OK)
