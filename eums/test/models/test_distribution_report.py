from unittest import TestCase

from eums.models import DistributionReport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class DistributionReportTest(TestCase):
    def test_should_have_all_expected_fields(self):
        report = DistributionReport()
        fields_in_report = report._meta._name_map

        self.assertEqual(len(report._meta.fields), 11)
        for field in ['consignee', 'programme', 'total_received_with_quality_issues',
                      'id', 'total_received_with_quantity_issues', 'total_received_without_issues',
                      'total_not_received', 'total_distributed_with_quality_issues',
                      'total_distributed_with_quantity_issues', 'total_distributed_without_issues',
                      'total_not_distributed']:
            self.assertIn(field, fields_in_report)

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
