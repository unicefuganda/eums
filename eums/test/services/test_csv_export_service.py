import os
from unittest import TestCase

from django.test import override_settings
from mock import patch, MagicMock

from eums.models import DistributionPlanNode
from eums.services.csv_export_service import CSVExportService
from eums.services.delivery_csv_export import DeliveryCSVExport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

DEFAULT_FROM_EMAIL = "hoho@ha.ha"
HOSTNAME = "ha.ha"
EMAIL_NOTIFICATION_CONTENT = "%s some content %s other content"


class ExportServiceTest(TestCase):

    def test_should_generate_csv_and_saves_in_static(self):
        header = [
            'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked' ]
        row_one = ['123', 'mama kit', 'material code', '10', 'delivery date', 'consignee name',
                   'some name', 'phone', 'location', 'Yes', 'No']

        expected_data = [header, row_one]
        filename = 'warehouse_deliveries.csv'
        CSVExportService.generate(expected_data, filename)

        csv_filename = 'eums/client/exports/' + filename
        actual_data = self._read_csv(csv_filename)
        self.assertEqual(actual_data, expected_data)

        self.remove_csv_file(csv_filename)

    @override_settings(HOSTNAME=HOSTNAME, DEFAULT_FROM_EMAIL=DEFAULT_FROM_EMAIL, EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    @patch('django.core.mail.send_mail')
    def test_notify_should_send_email_to_user(self, mock_send_email):
        csv_exporter = DeliveryCSVExport('Waybill')
        user = MagicMock()
        email = 'haha@ha.ha'
        name = 'manchester united'
        user.email = email
        user.first_name = name
        filename = 'some filename.csv'
        CSVExportService.notify(user, filename)

        expected_link = 'http://%s/static/exports/%s' % (HOSTNAME, filename)
        expected_message = EMAIL_NOTIFICATION_CONTENT % (name, expected_link)

        mock_send_email.assert_called_once_with("Warehouse Delivery Download", expected_message, DEFAULT_FROM_EMAIL, [email])

    def _read_csv(self, filename):
        file_ = open(filename, 'r')
        lines = file_.readlines()
        return [list(eval(line.strip())) for line in lines]

    def remove_csv_file(self, filename):
        os.remove(filename)