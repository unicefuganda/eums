import datetime

import factory

from eums.models.system_settings import SystemSettings


class SystemSettingsFactory(factory.DjangoModelFactory):
    class Meta:
        model = SystemSettings

    auto_track = False
    sync_start_date = datetime.date.today()
