from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
import factory

from eums.models import Run


class RunFactory(factory.DjangoModelFactory):
    class Meta:
        model = Run

    scheduled_message_task_id = factory.Sequence(lambda n: '{0}'.format(n))
    runnable = factory.SubFactory(DistributionPlanNodeFactory)
    status = Run.STATUS.scheduled
    phone = factory.Sequence(lambda n: '{0}'.format(n))