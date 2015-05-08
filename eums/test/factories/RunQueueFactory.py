from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
import factory

from eums.models import RunQueue


class RunQueueFactory(factory.DjangoModelFactory):
    class Meta:
        model = RunQueue

    node = factory.SubFactory(DistributionPlanNodeFactory)
    contact_person_id = 'b8f951a0-4d5a-11e4-9af8-0002a5d5c51b'
    run_delay = 0
    status = RunQueue.STATUS.not_started

