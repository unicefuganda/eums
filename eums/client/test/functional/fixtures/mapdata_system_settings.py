from eums.models import SystemSettings
from eums.test.factories.system_settings_factory import SystemSettingsFactory

SystemSettings.objects.create() if SystemSettings.objects.count() is 0 else None
