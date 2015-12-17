from eums.models import SystemSettings
from eums.test.factories.system_settings_factory import SystemSettingsFactory

SystemSettingsFactory() if SystemSettings.objects.count() is 0 else None
