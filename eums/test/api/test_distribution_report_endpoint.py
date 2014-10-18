from rest_framework.test import APITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.distribution_report_factory import DistributionReportFactory


ENDPOINT_URL = BACKEND_URL + 'distribution-report/'


class DistributionReportEndPointTest(APITestCase):
    def test_should_read_distribution_report(self):
        report = DistributionReportFactory()

        response = self.client.get(ENDPOINT_URL, format='json')

        expected_response = [{'consignee': report.consignee.id, 'programme': report.programme.id,
                             'total_received_with_quality_issues': 1, 'id': 1,
                             'total_received_with_quantity_issues': 1, 'total_received_without_issues': 1,
                             'total_not_received': 1, 'total_distributed_with_quality_issues': 1,
                             'total_distributed_with_quantity_issues': 1, 'total_distributed_without_issues': 1,
                             'total_not_distributed': 1}]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(expected_response, response.data)

