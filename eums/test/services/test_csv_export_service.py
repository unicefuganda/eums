import os
from unittest import TestCase
from django.test import override_settings
from mock import patch, MagicMock
from eums.services.csv_export_service import CSVExportService, set_remote_contact_to_report_item

DEFAULT_FROM_EMAIL = "hoho@ha.ha"


class ExportServiceTest(TestCase):
    def test_should_excel_separator_identifier_on_the_first_line(self):
        header = ['header1', 'header2']
        row_one = ['value1', 'value2']

        data = [header, row_one]
        filename = 'direct_deliveries.exporter'
        category = 'delivery'
        CSVExportService.generate(data, category, filename)

        csv_filename = 'eums/client/exports/' + category + '/' + filename
        first_row, written_data = self._read_csv(csv_filename)
        self.assertEqual(first_row, 'sep=,\n')

        self._remove_csv_file(csv_filename)

    def test_should_generate_csv_and_saves_in_static(self):
        header = [
            'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked']
        row_one = ['123', 'mama kit', 'material code', '10', 'delivery date', 'consignee name',
                   'some name', 'phone', 'location', 'Yes', 'No']

        expected_data = [header, row_one]
        filename = 'warehouse_deliveries.exporter'
        category = 'delivery'
        CSVExportService.generate(expected_data, category, filename)

        csv_filename = 'eums/client/exports/' + category + '/' + filename
        first_row, actual_data = self._read_csv(csv_filename)
        self.assertEqual(actual_data, expected_data)

        self.remove_csv_file(csv_filename)

    @override_settings(DEFAULT_FROM_EMAIL=DEFAULT_FROM_EMAIL)
    @patch('django.core.mail.send_mail')
    def test_notify_should_send_email_to_user(self, mock_send_email):
        user = MagicMock()
        email = 'haha@ha.ha'
        name = 'manchester united'
        user.email = email
        user.username = name
        subject = "some subject"
        message = "some %s message"

        CSVExportService.notify(user, subject, message)

        expected_message = "some manchester united message"
        mock_send_email.assert_called_once_with(subject, expected_message, DEFAULT_FROM_EMAIL, [email])

    @patch('eums.util.contact_client.ContactClient.get')
    def test_set_remote_contact_to_report_item(self, get_contact):
        contact_id = '5694bdd328c0edad08b0f020'

        first_name = 'Shenjian'
        last_name = 'Yuan'
        phone = '18192235667'
        contact_name = '%s %s' % (first_name, last_name)

        contact = {'firstName': first_name, 'lastName': last_name, 'phone': phone}
        get_contact.return_value = contact
        report_item = {'contact_person_id': contact_id}
        set_remote_contact_to_report_item(report_item)

        self.assertEqual(report_item['contactName'], contact_name)
        self.assertTrue(report_item['contactPhone'], phone)
        get_contact.assert_called_once_with(contact_id)

    def _read_csv(self, filename):
        file_ = open(filename, 'r')
        lines = file_.readlines()
        return lines[0], [list(eval(line.strip())) for line in lines[1:]]

    def _remove_csv_file(self, filename):
        os.remove(filename)
