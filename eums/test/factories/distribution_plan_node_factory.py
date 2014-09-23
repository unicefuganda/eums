import factory

from eums.models import DistributionPlanNode
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory


class DistributionPlanNodeFactory(factory.Factory):
    class Meta:
        model = DistributionPlanNode

    parent = None
    distribution_plan = factory.SubFactory(DistributionPlanFactory)
    consignee = factory.SubFactory(ConsigneeFactory)
