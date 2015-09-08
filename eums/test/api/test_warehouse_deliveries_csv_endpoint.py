from eums.models import DistributionPlanNode
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from mock import patch


ENDPOINT_URL = BACKEND_URL + 'warehouse-deliveries-csv/'


class TestWarehouseDeliveriesCSVEndpoint(AuthenticatedAPITestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @patch('eums.services.csv_export_service.CSV_Export_Service.generate')
    def test_should_return_csv_with_warehouse_deliveries(self, mock_generate_csv):
        expected_data = {'message': 'Generating CSV, you will be notified via email once it is done.'}

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_data)
        self.assertTrue(mock_generate_csv.called)
