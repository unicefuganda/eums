from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from eums.models import Alert


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

    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

alert_router = DefaultRouter()
alert_router.register(r'alert', AlertViewSet)


class AlertCount(APIView):

    def get(self, request, *args, **kwargs):
        total_count = Alert.objects.count()
        unresolved = Alert.objects.filter(is_resolved=False).count()
        result = {'total': total_count, 'unresolved': unresolved}
        return Response(result, status=status.HTTP_200_OK)
