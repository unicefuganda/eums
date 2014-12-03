import factory

from eums.models import NodeLineItemRun
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory


class NodeLineItemRunFactory(factory.DjangoModelFactory):
    class Meta:
        model = NodeLineItemRun

    scheduled_message_task_id = factory.Sequence(lambda n: '{0}'.format(n))
    node_line_item = factory.SubFactory(DistributionPlanLineItemFactory)
    status = NodeLineItemRun.STATUS.scheduled
    phone = factory.Sequence(lambda n: '{0}'.format(n))