from unittest import TestCase

from mock import patch

from eums.settings_export import EMAIL_COMMON_SUBJECT, EMAIL_NOTIFICATION_CONTENT, CSV_EXPIRED_HOURS
from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter


class DeliveryFeedbackReportExporterTest(TestCase):
    HOSTNAME = 'http://ha.ha/'

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

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
        value = 21990
        date_of_receipt = '2015-11-19T16:00:00.000Z'
        programme = {'id': 1, 'name': ''}
        deliveries_feedback = [{'deliveryReceived': delivery_received,
                                'shipmentDate': shipment_date,
                                'orderNumber': order_number,
                                'satisfiedWithDelivery': satisfied_with_delivery,
                                'consignee': consignee,
                                'additionalDeliveryComments': additional_delivery_comments,
                                'isDeliveryInGoodOrder': is_delivery_in_good_order,
                                'value': value,
                                'dateOfReceipt': date_of_receipt,
                                'programme': programme}, ]
        row_value = [delivery_received,
                     shipment_date,
                     date_of_receipt,
                     order_number,
                     programme.get('name'),
                     consignee.get('name'),
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
