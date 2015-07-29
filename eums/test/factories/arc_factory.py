import factory

from eums.models import Arc
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory


class ArcFactory(factory.DjangoModelFactory):
    class Meta:
        model = Arc

    source = factory.SubFactory(DistributionPlanFactory)
    target = factory.SubFactory(DistributionPlanFactory)
    quantity = 100
