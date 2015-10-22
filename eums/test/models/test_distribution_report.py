from unittest import TestCase

from eums.models import DistributionReport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class DistributionReportTest(TestCase):
    def test_string_representation_is_consignee_name_and_programme_name(self):
        consignee = ConsigneeFactory()
        programme = ProgrammeFactory()
        report = DistributionReport(consignee=consignee, programme=programme)
        self.assertEqual('%s, %s' % (consignee.name, programme.name), str(report))

    def test_consignee_and_programme_should_be_unique_together(self):
        report = DistributionReport()
        self.assertEqual(report._meta.unique_together, (('consignee', 'programme'),))

    def tearDown(self):
        DistributionReport.objects.all().delete()
