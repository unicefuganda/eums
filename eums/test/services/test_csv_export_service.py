from unittest import TestCase

import os
from django.test import override_settings
from mock import patch, MagicMock
from eums.services.csv_export_service import CSVExportService

DEFAULT_FROM_EMAIL = "hoho@ha.ha"


class ExportServiceTest(TestCase):
    def test_should_generate_csv_and_saves_in_static(self):
        header = [
            'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked']
        row_one = ['123', 'mama kit', 'material code', '10', 'delivery date', 'consignee name',
                   'some name', 'phone', 'location', 'Yes', 'No']

        expected_data = [header, row_one]
        filename = 'warehouse_deliveries.csv'
        CSVExportService.generate(expected_data, filename)

        csv_filename = 'eums/client/exports/' + filename
        first_row, actual_data = self._read_csv(csv_filename)
        self.assertEqual(first_row, 'sep=,\n')
        self.assertEqual(actual_data, expected_data)

        self.remove_csv_file(csv_filename)

    @override_settings(DEFAULT_FROM_EMAIL=DEFAULT_FROM_EMAIL)
    @patch('django.core.mail.send_mail')
    def test_notify_should_send_email_to_user(self, mock_send_email):
        user = MagicMock()
        email = 'haha@ha.ha'
        name = 'manchester united'
        user.email = email
        user.first_name = name
        subject = "some subject"
        message = "some %s message"

        CSVExportService.notify(user, subject, message)

        expected_message = "some manchester united message"

        mock_send_email.assert_called_once_with(subject, expected_message, DEFAULT_FROM_EMAIL, [email])

    def _read_csv(self, filename):
        file_ = open(filename, 'r')
        lines = file_.readlines()
        return lines[0], [list(eval(line.strip())) for line in lines[1:]]

    def remove_csv_file(self, filename):
        os.remove(filename)