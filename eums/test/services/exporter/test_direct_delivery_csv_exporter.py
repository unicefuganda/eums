from unittest import TestCase
from mock import patch

from eums.export_settings import EMAIL_COMMON_SUBJECT, EMAIL_NOTIFICATION_CONTENT, CSV_EXPIRED_HOURS
from eums.models import DistributionPlanNode, PurchaseOrderItem, PurchaseOrder
from eums.services.exporter.delivery_csv_exporter import DeliveryCSVExporter
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class DirectDeliveryExporterTest(TestCase):
    HOSTNAME = "http://ha.ha/"

    def tearDown(self):
        DistributionPlanNode.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        PurchaseOrder.objects.all().delete()

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_get_export_list_for_direct_delivery(self, mock_build_contact):
        contact = {'firstName': 'John', 'lastName': 'Ssenteza', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact
        delivery = DeliveryFactory()
        consignee_name = 'the consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        order_number = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 33'
        ro_item = PurchaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                           purchase_order=PurchaseOrderFactory(order_number=order_number))
        delivery_date = '2015-09-06'
        luweero = 'Luweero'
        remark = 'some remark'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=luweero, remark=remark)

        header = [
            'Purchase Order', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked', 'Remarks']
        row_one = [order_number, mama_kit, material_code, 10, delivery_date, consignee_name,
                   '%s %s' % (contact['firstName'], contact['lastName']),
                   contact['phone'], luweero, 'Yes', 'No', remark]

        expected_data = [header, row_one]

        csv_exporter = DeliveryCSVExporter.create_delivery_exporter_by_type('Direct', self.HOSTNAME)

        TestCase.maxDiff = None
        self.assertEqual(csv_exporter.assemble_csv_data(), expected_data)

    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_should_return_correct_notification_details_for_direct_delivery(self, mock_generate_exported_csv_file_name):
        file_name = 'direct_deliveries_1448892495779.csv'
        mock_generate_exported_csv_file_name.return_value = file_name
        category = 'delivery'
        direct_csv_export = DeliveryCSVExporter.create_delivery_exporter_by_type('Direct', self.HOSTNAME)
        export_label = direct_csv_export.export_label

        details = (EMAIL_COMMON_SUBJECT, EMAIL_NOTIFICATION_CONTENT.format(export_label,
                                                                           'http://ha.ha/static/exports/' + category +
                                                                           '/' + file_name, CSV_EXPIRED_HOURS))
        self.assertEqual(direct_csv_export.notification_details(), details)
