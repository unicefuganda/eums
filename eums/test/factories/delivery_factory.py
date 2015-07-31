from datetime import datetime
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
    contact_person_id = 'E477323D-EE68-40BB-8403-584919997EEB'
    track = False
    delivery_date = datetime.today()
    remark = 'some remarks'
