from datetime import datetime, date
import factory

from eums.models import DistributionPlan
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class DeliveryFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlan

    programme = factory.SubFactory(ProgrammeFactory)
    location = 'Kampala'
    consignee = factory.SubFactory(ConsigneeFactory)
    contact_person_id = '56494e2e1486bd312e4b2f31'
    track = False
    delivery_date = date.today()
    remark = 'some remarks'
    time_limitation_on_distribution = None
    confirmed = False
