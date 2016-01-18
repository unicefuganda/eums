import logging
from unittest import TestCase

from mock import patch

from eums.settings_export import EMAIL_COMMON_SUBJECT, EMAIL_NOTIFICATION_CONTENT, CSV_EXPIRED_HOURS
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter

logger = logging.getLogger(__name__)


class DeliveryFeedbackReportExporterTest(TestCase):
    HOSTNAME = 'http://ha.ha/'

    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_generate_delivery_feedback_report_should_return_correct_notification_details(self,
                                                                                          generate_exported_csv_file_name):
        file_name = 'deliveries_feedback_report_1448892495779.csv'
        generate_exported_csv_file_name.return_value = file_name
        delivery_feedback_report_csv_export = DeliveryFeedbackReportExporter(self.HOSTNAME)
        category = 'report/feedback'
        export_label = delivery_feedback_report_csv_export.export_label
        details = (EMAIL_COMMON_SUBJECT, EMAIL_NOTIFICATION_CONTENT.format(export_label,
                                                                           'http://ha.ha/static/exports/' + category +
                                                                           '/' + file_name, CSV_EXPIRED_HOURS))
        self.assertEqual(delivery_feedback_report_csv_export.notification_details(), details)

    def test_assemble_csv_data(self):
        delivery_received = 'Yes'
        shipment_date = '2015-11-20'
        order_number = 81020737
        satisfied_with_delivery = 'Yes'
        consignee = {'id': 1, 'name': 'WAKISO DHO'}
        additional_delivery_comments = 'good'
        is_delivery_in_good_order = 'Yes'
        contact_person_id = '5694bdd328c0edad08b0f020'
        value = 21990
        date_of_receipt = '2015-11-19T16:00:00.000Z'
        programme = {'id': 1, 'name': ''}
        first_name = 'Shenjian'
        last_name = 'Yuan'
        phone = '18192235667'
        contact_name = '%s %s' % (first_name, last_name)

        deliveries_feedback = [{'deliveryReceived': delivery_received,
                                'shipmentDate': shipment_date,
                                'orderNumber': order_number,
                                'satisfiedWithDelivery': satisfied_with_delivery,
                                'consignee': consignee,
                                'additionalDeliveryComments': additional_delivery_comments,
                                'isDeliveryInGoodOrder': is_delivery_in_good_order,
                                'value': value,
                                'dateOfReceipt': date_of_receipt,
                                'programme': programme,
                                'contactName': contact_name,
                                'contactPhone': phone,
                                'contactPersonId': contact_person_id,
                                }, ]

        row_value = [delivery_received,
                     shipment_date,
                     date_of_receipt,
                     order_number,
                     programme.get('name'),
                     consignee.get('name'),
                     contact_name,
                     phone,
                     value,
                     is_delivery_in_good_order,
                     satisfied_with_delivery,
                     additional_delivery_comments
                     ]

        csv_exporter = DeliveryFeedbackReportExporter(self.HOSTNAME)
        header = csv_exporter.config_headers()
        expect_data = [header, row_value]
        assembled_data = csv_exporter.assemble_csv_data(deliveries_feedback)

        self.assertEqual(expect_data, assembled_data)
        self.assertTrue(len(assembled_data) is 2)
