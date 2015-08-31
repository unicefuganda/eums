from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from eums.api.standard_pagination import StandardResultsSetPagination
from eums.models import Alert, UserProfile


class AlertSerializer(serializers.ModelSerializer):

    class Meta:
        model = Alert
        fields = (
            'order_type',
            'order_number',
            'issue',
            'is_resolved',
            'remarks',
            'consignee_name',
            'contact_name',
            'created_on',
            'issue_display_name',
            'item_description'
        )


class AlertViewSet(ReadOnlyModelViewSet):
    pagination_class = StandardResultsSetPagination
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

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
