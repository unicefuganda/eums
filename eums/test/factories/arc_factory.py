import factory

from eums.models import Arc
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory


class ArcFactory(factory.DjangoModelFactory):
    class Meta:
        model = Arc

    source = factory.SubFactory(DistributionPlanNodeFactory)
    target = factory.SubFactory(DistributionPlanNodeFactory)
    quantity = 100
