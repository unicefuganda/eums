from unittest import TestCase
from django.db.backends.dummy.base import ignore
from django.test import override_settings
from mock import patch
from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter
from eums.services.exporter.item_feedback_report_csv_exporter import ItemFeedbackReportExporter
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class DeliveryFeedbackReportExporterTest(TestCase):
    HOSTNAME = 'http://ha.ha/'
    EMAIL_NOTIFICATION_CONTENT = '%s some content {0} other content {1}'

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    @override_settings(EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_generate_delivery_feedback_report_should_return_correct_notification_details(self,
                                                                                          generate_exported_csv_file_name):
        file_name = 'deliveries_feedback_report_1448892495779.csv'
        generate_exported_csv_file_name.return_value = file_name
        delivery_feedback_reort_csv_export = DeliveryFeedbackReportExporter(self.HOSTNAME)
        category = 'report/feedback'
        details = ('Delivery Feedback Report Download',
                   '%s some content Delivery Feedback Report other content http://ha.ha/static/exports/' + category +
                   '/' + file_name)
        self.assertEqual(delivery_feedback_reort_csv_export.notification_details(), details)

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
        assemble_row_value = assembled_data[1]
        self.assertTrue(len(assemble_row_value) is len(header))
        self.assertTrue(delivery_received in assemble_row_value)
        self.assertTrue(consignee.get('name') in assemble_row_value)
        self.assertTrue(shipment_date in assemble_row_value)
        self.assertTrue(is_delivery_in_good_order in assemble_row_value)
        self.assertTrue(order_number in assemble_row_value)
        self.assertTrue(additional_delivery_comments in assemble_row_value)
        self.assertTrue(programme.get('name') in assemble_row_value)
        self.assertTrue(satisfied_with_delivery in assemble_row_value)
        self.assertTrue(value in assemble_row_value)
        self.assertTrue(date_of_receipt in assemble_row_value)
