from django.contrib.auth.models import User
from django.test import override_settings
from eums.models import DistributionPlanNode
from eums.services.csv_export_service import CSVExportService
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from mock import patch


ENDPOINT_URL = '/exports/warehouse-deliveries/'


class TestWarehouseDeliveriesCSVEndpoint(AuthenticatedAPITestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @override_settings(CELERY_ALWAYS_EAGER=True)
    @patch('eums.services.csv_export_service.RealCSVExportService.notify')
    @patch('eums.services.csv_export_service.RealCSVExportService.generate')
    @patch('eums.services.csv_export_service.CSVExportService.data')
    def test_should_start_async_csv_generation_with_warehouse_deliveries(self, mock_data, mock_generate_csv, mock_notify_user):
        expected_data = {'message': 'Generating CSV, you will be notified via email once it is done.'}

        some_data = ['some data']
        mock_data.return_value = some_data

        response = self.client.get(ENDPOINT_URL)
        user = User.objects.get(username='test')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_data)
        self.assertTrue(mock_data.called)
        mock_generate_csv.assert_called_once_with(some_data, CSVExportService.FILENAME)
        mock_notify_user.assert_called_once_with(user, CSVExportService.FILENAME)
