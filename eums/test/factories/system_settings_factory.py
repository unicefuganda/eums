import factory
from eums.models import Alert, ReleaseOrderItem
from eums.models.system_settings import SystemSettings
from eums.test.factories.delivery_factory import DeliveryFactory


class SystemSettingsFactory(factory.DjangoModelFactory):
    class Meta:
        model = SystemSettings

    auto_track = False
