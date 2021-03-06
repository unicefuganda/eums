import factory

from eums.models import Alert, ReleaseOrderItem
from eums.test.factories.delivery_factory import DeliveryFactory


class AlertFactory(factory.DjangoModelFactory):
    class Meta:
        model = Alert

    order_type = ReleaseOrderItem.WAYBILL
    order_number = factory.Sequence(lambda n: "123456{0}".format(n))
    item_description = factory.Sequence(lambda n: "some description {0}".format(n))
    issue = Alert.ISSUE_TYPES.not_received
    is_resolved = False
    remarks = None
    consignee_name = 'Wakiso DHO'
    runnable = factory.SubFactory(DeliveryFactory)
