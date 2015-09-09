import os
from unittest import TestCase

from django.test import override_settings
from mock import patch, MagicMock

from eums.models import DistributionPlanNode
from eums.services.csv_export_service import CSVExportService
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

    def setUp(self):
        self.header = [
                'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
                'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
                'Is Tracked' ]

    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_get_export_list_for_warehouse(self, mock_build_contact):
        contact = {'firstName': 'John', 'lastName': 'Ssenteza', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact
        delivery = DeliveryFactory(track=True)
        consignee_name = 'the consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        waybill = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 30'
        ro_item = ReleaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                          release_order=ReleaseOrderFactory(waybill=waybill))
        delivery_date = '2015-09-06'
        luweero = 'Luweero'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=luweero)

        row_one=[waybill, mama_kit, material_code, 10, delivery_date, consignee_name,
                '%s %s' % (contact['firstName'], contact['lastName']),
                contact['phone'], luweero, 'Yes', 'No']


        csv_exporter = CSVExportService('Waybill')

        expected_data = [self.header, row_one]
        data = csv_exporter.data()
        self.assertEqual(data, expected_data)

    @patch('eums.services.csv_export_service.CSVExportService.data')
    def test_should_generate_csv_and_saves_in_static(self, mock_node_data):
        row_one = ['123', 'mama kit', 'material code', '10', 'delivery date', 'consignee name',
                   'some name', 'phone', 'location', 'Yes', 'No']

        expected_data = [self.header, row_one]
        mock_node_data.return_value = expected_data
        csv_exporter = CSVExportService('Waybill')
        csv_exporter.generate()

        csv_filename = 'eums/client/exports/warehouse_deliveries.csv'
        actual_data = self._read_csv(csv_filename)
        self.assertEqual(actual_data, expected_data)

        self.remove_csv_file(csv_filename)

    @override_settings(HOSTNAME=HOSTNAME, DEFAULT_FROM_EMAIL=DEFAULT_FROM_EMAIL, EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    @patch('django.core.mail.send_mail')
    def test_notify_should_send_email_to_user(self, mock_send_email):
        csv_exporter = CSVExportService('Waybill')
        user = MagicMock()
        email = 'haha@ha.ha'
        name = 'manchester united'
        user.email = email
        user.first_name = name
        csv_exporter.notify(user)

        expected_link = 'http://%s/static/exports/warehouse_deliveries.csv' % HOSTNAME
        expected_message = EMAIL_NOTIFICATION_CONTENT % (name, expected_link)

        mock_send_email.assert_called_once_with("Warehouse Delivery Download", expected_message, DEFAULT_FROM_EMAIL, [email])

    def _read_csv(self, filename):
        file_ = open(filename, 'r')
        lines = file_.readlines()
        return [list(eval(line.strip())) for line in lines]

    def remove_csv_file(self, filename):
        os.remove(filename)