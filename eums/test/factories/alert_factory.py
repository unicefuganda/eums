import factory
from eums.models import Alert
from eums.test.factories.runnable_factory import RunnableFactory
from eums.test.factories.user_factory import UserFactory


class AlertFactory(factory.DjangoModelFactory):
    class Meta:
        model = Alert

    order_type = Alert.ORDER_TYPES.waybill
    order_number = factory.Sequence(lambda n: "123456{0}".format(n))
    issue = Alert.ISSUE_TYPES.not_received
    is_resolved = False
    remarks = None
    consignee_name = 'wakiso'
    contact_name = 'john doe'
    delivery_sender = factory.SubFactory(UserFactory)
    runnable = factory.SubFactory(RunnableFactory)
