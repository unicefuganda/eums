from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.distribution_report_factory import DistributionReportFactory


ENDPOINT_URL = BACKEND_URL + 'distribution-report/'


class DistributionReportEndPointTest(AuthenticatedAPITestCase):
    def test_should_read_distribution_report(self):
        report = DistributionReportFactory()

        response = self.client.get(ENDPOINT_URL, format='json')

        expected_response = [{'consignee': report.consignee.id, 'programme': report.programme.id,
                              'total_received': 1, 'id': 1, 'total_not_received': 1, 'total_distributed': 1}]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(expected_response, response.data)

