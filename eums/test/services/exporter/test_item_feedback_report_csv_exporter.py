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


class ItemFeedbackReportExporterTest(TestCase):
    HOSTNAME = 'http://ha.ha/'
    EMAIL_NOTIFICATION_CONTENT = '%s some content {0} other content {1}'

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    @override_settings(EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_generate_item_feedback_report_should_return_correct_notification_details(self,
                                                                                      generate_exported_csv_file_name):
        file_name = 'items_feedback_report_1448892495779.csv'
        generate_exported_csv_file_name.return_value = file_name
        item_feedback_report_csv_export = ItemFeedbackReportExporter(self.HOSTNAME)
        category = 'report/feedback'
        details = ('Item Feedback Report Download',
                   '%s some content Item Feedback Report other content http://ha.ha/static/exports/' + category +
                   '/' + file_name)
        self.assertEqual(item_feedback_report_csv_export.notification_details(), details)

    def test_assemble_csv_data(self):
        item_description = 'Cable binder black2.5x100mm'
        programme = {'id': 1, 'name': ''}
        tree_position = 'IMPLEMENTING_PARTNER'
        consignee = 'WAKISO DHO'
        implementing_partner = 'WAKISO DHO'
        order_number = 81020737
        quantity_shipped = 4
        value = 4.48
        answers = {'qualityOfProduct': 'Good', 'amountReceived': 4, 'itemReceived': 'Yes',
                   'satisfiedWithProduct': 'Yes', 'additionalDeliveryComments': ''}

        amount_received = 4
        quality_of_product = 'Good'
        satisfied_with_product = 'Yes'
        additional_delivery_comments = ''
        items_feedback = [{'tree_position': tree_position,
                           'additionalDeliveryComments': additional_delivery_comments,
                           'qualityOfProduct': quality_of_product,
                           'amountReceived': amount_received,
                           'consignee': consignee,
                           'answers': answers,
                           'satisfiedWithProduct': satisfied_with_product,
                           'implementing_partner': implementing_partner,
                           'value': value,
                           'programme': programme,
                           'order_number': order_number,
                           'item_description': item_description,
                           'quantity_shipped': quantity_shipped}, ]

        header = ItemFeedbackReportExporter.HEADER_DIC_KEY_MAP.keys()

        csv_exporter = ItemFeedbackReportExporter(self.HOSTNAME)
        assembled_data = csv_exporter.assemble_csv_data(items_feedback)
        assemble_row_value = assembled_data[1]

        self.assertTrue(len(assembled_data) is 2)
        self.assertTrue(len(assemble_row_value) is len(header))

        self.assertTrue(order_number in assemble_row_value)
        self.assertTrue(consignee in assemble_row_value)
        self.assertTrue(value in assemble_row_value)
        self.assertTrue(programme.get('name') in assemble_row_value)
        self.assertTrue(quantity_shipped in assemble_row_value)
        self.assertTrue(answers.get('itemReceived') in assemble_row_value)
        self.assertTrue(tree_position in assemble_row_value)
        self.assertTrue(satisfied_with_product in assemble_row_value)
        self.assertTrue(answers.get('dateOfReceipt') in assemble_row_value)
        self.assertTrue(implementing_partner in assemble_row_value)
        self.assertTrue(item_description in assemble_row_value)
        self.assertTrue(additional_delivery_comments in assemble_row_value)
        self.assertTrue(quality_of_product in assemble_row_value)
        self.assertTrue(amount_received in assemble_row_value)
