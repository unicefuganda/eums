import factory
from eums.models import DistributionReport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class DistributionReportFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionReport

    consignee = factory.SubFactory(ConsigneeFactory)
    programme = factory.SubFactory(ProgrammeFactory)
    total_received_with_quality_issues = 1
    total_received_with_quantity_issues = 1
    total_received_without_issues = 1
    total_not_received = 1
    total_distributed_with_quality_issues = 1
    total_distributed_with_quantity_issues = 1
    total_distributed_without_issues = 1
    total_not_distributed = 1


