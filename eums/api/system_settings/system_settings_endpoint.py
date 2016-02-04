from rest_framework import serializers
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.models.system_settings import SystemSettings
from eums.permissions.system_settings_permissions import SystemSettingsPermissions


class SystemSettingsSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ('id', 'auto_track', 'sync_start_date', 'notification_message', 'district_label')


class SystemSettingsViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, SystemSettingsPermissions)
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerialiser


system_settings_routers = DefaultRouter()
system_settings_routers.register(r'system-settings', SystemSettingsViewSet)
