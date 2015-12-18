from eums.models import SystemSettings

SystemSettings.objects.create() if SystemSettings.objects.count() is 0 else None
