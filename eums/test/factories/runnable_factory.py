import factory

from eums.test.helpers.fake_datetime import FakeDate
from eums.models import Runnable
from eums.test.factories.consignee_factory import ConsigneeFactory


class RunnableFactory(factory.DjangoModelFactory):
    class Meta:
        model = Runnable

    consignee = factory.SubFactory(ConsigneeFactory)
    location = "Kampala"
    contact_person_id = factory.Sequence(lambda n: "{0}".format(n))
    track = False
    delivery_date = FakeDate.today()
    remark = "In good condition"

