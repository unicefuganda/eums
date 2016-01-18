from django.contrib.auth.models import User
from django.test import override_settings
from mock import patch

from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase

ENDPOINT_URL = '/exports/stocks-report/'


class TestStockCSVEndpoint(AuthenticatedAPITestCase):

    @patch('eums.services.csv_export_service.generate_stock_feedback_report.delay')
    def test_should_use_hostname(self, mock_generate_task_delay):
        response = self.client.get(ENDPOINT_URL)
        user = User.objects.get(username='test')

        self.assertEqual(response.status_code, 200)
        mock_generate_task_delay.assert_called_once_with(user, 'http://testserver/', [])

    @override_settings(CELERY_ALWAYS_EAGER=True)
    @patch('eums.services.csv_export_service.CSVExportService.notify')
    @patch('eums.services.exporter.stock_report_csv_exporter.StockReportExporter.notification_details')
    @patch('eums.services.csv_export_service.CSVExportService.generate')
    @patch('eums.services.exporter.stock_report_csv_exporter.ReportExporter.assemble_csv_data')
    @patch('eums.services.exporter.stock_report_csv_exporter.StockReportExporter.generate_exported_csv_file_name')
    @patch('eums.api.stock_report.stock_report_endpoint.filter_stock_report')
    def test_should_start_async_csv_generation_with_direct_deliveries(
            self, mock_filter_stock_report,mock_generate_exported_csv_file_name,
            mock_assemble_csv_data,
            mock_generate_csv,
            mock_notification_details, mock_notify_user):
        expected_data = {'message': 'Generating CSV, you will be notified via email once it is done.'}

        some_data = ['some data']
        mock_assemble_csv_data.return_value = some_data
        mock_filter_stock_report.return_value = []

        file_name = 'stocks_report_1448892495779.csv'
        mock_generate_exported_csv_file_name.return_value = file_name

        mock_notification_details.return_value = ('subject', 'message')

        response = self.client.get(ENDPOINT_URL)
        user = User.objects.get(username='test')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected_data)
        self.assertTrue(mock_generate_exported_csv_file_name.called)
        self.assertTrue(mock_assemble_csv_data.called)

        mock_generate_csv.assert_called_once_with(some_data, 'report/feedback', file_name)
        mock_notify_user.assert_called_once_with(user, 'subject', 'message')

