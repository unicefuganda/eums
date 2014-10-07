from datetime import datetime
import factory

from eums.models import RunQueue
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory


class RunQueueFactory(factory.DjangoModelFactory):
    class Meta:
        model = RunQueue

    node_line_item = factory.SubFactory(DistributionPlanLineItemFactory)
    contact_person_id = 'b8f951a0-4d5a-11e4-9af8-0002a5d5c51b'
    run_delay = 0
    status = RunQueue.STATUS.not_started

