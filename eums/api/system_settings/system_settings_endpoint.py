from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from eums.models.system_settings import SystemSettings


class SystemSettingsSerialiser(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ('id', 'auto_track', 'sync_start_date')


class SystemSettingsViewSet(ModelViewSet):
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerialiser

    def update(self, request, *args, **kwargs):
        super(SystemSettingsViewSet, self).update(request, args, kwargs)
        return Response()


system_settings_routers = DefaultRouter()
system_settings_routers.register(r'system-settings', SystemSettingsViewSet)
