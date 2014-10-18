import factory
from eums.models import DistributionReport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class DistributionReportFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionReport

    consignee = factory.SubFactory(ConsigneeFactory)
    programme = factory.SubFactory(ProgrammeFactory)
    total_received = 1
    total_not_received = 1
    total_distributed = 1

