from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
import factory

from eums.models import NodeLineItemRun


class NodeRunFactory(factory.DjangoModelFactory):
    class Meta:
        model = NodeLineItemRun

    scheduled_message_task_id = factory.Sequence(lambda n: '{0}'.format(n))
    node = factory.SubFactory(DistributionPlanNodeFactory)
    status = NodeLineItemRun.STATUS.scheduled
    phone = factory.Sequence(lambda n: '{0}'.format(n))