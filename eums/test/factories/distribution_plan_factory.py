import factory

from eums.models import DistributionPlan
from eums.test.factories.programme_factory import ProgrammeFactory


class DistributionPlanFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlan

    programme = factory.SubFactory(ProgrammeFactory)