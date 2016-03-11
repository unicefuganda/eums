from eums.models import SystemSettings


class SystemSettingsService(object):
    @staticmethod
    def get_system_settings():
        return SystemSettings.objects.first()
