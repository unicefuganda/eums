from rest_framework import serializers
from rest_framework.routers import DefaultRouter
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
            'issue_display_name'
        )

class AlertViewSet(ReadOnlyModelViewSet):

    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

alert_router = DefaultRouter()
alert_router.register(r'alert', AlertViewSet)