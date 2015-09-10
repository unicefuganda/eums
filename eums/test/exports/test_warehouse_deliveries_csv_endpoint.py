from django.contrib.auth.models import User
from django.test import override_settings
from eums.models import DistributionPlanNode
from eums.services.delivery_csv_export import DeliveryCSVExport
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from mock import patch


ENDPOINT_URL = '/exports/deliveries/'


class TestWarehouseDeliveriesCSVEndpoint(AuthenticatedAPITestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @override_settings(CELERY_ALWAYS_EAGER=True)
    @patch('eums.services.csv_export_service.CSVExportService.notify')
    @patch('eums.services.delivery_csv_export.DeliveryCSVExport.notification_details')
    @patch('eums.services.csv_export_service.CSVExportService.generate')
    @patch('eums.services.delivery_csv_export.DeliveryCSVExport.data')
    def test_should_start_async_csv_generation_with_warehouse_deliveries(self, mock_data, mock_generate_csv, mock_notification_details, mock_notify_user):
        expected_data = {'message': 'Generating CSV, you will be notified via email once it is done.'}

        some_data = ['some data']
        mock_data.return_value = some_data
        mock_notification_details.return_value = ('subject', 'message')

        response = self.client.get(ENDPOINT_URL)
        user = User.objects.get(username='test')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_data)
        self.assertTrue(mock_data.called)
        mock_generate_csv.assert_called_once_with(some_data, 'warehouse_deliveries.csv')
        mock_notify_user.assert_called_once_with(user, 'subject', 'message')
