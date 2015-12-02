from unittest import TestCase
from django.test import override_settings
from mock import patch
from eums.models import DistributionPlanNode, PurchaseOrderItem, PurchaseOrder, ReleaseOrderItem
from eums.services.exporter.delivery_csv_exporter import DeliveryCSVExporter
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

HOSTNAME = "http://ha.ha/"
EMAIL_NOTIFICATION_CONTENT = "%s some content {0} other content {1}"


class DirectDeliveryExporterTest(TestCase):
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

        csv_exporter = DeliveryCSVExporter.create_delivery_exporter_by_type('Direct', HOSTNAME)

        print 'query_date-->%s' % str(csv_exporter.assemble_csv_data())
        print 'expected_data-->%s' % str(expected_data)
        print 'is_equal-->%s' % str(expected_data == csv_exporter.assemble_csv_data())
        TestCase.maxDiff = None
        self.assertEqual(csv_exporter.assemble_csv_data(), expected_data)

    @override_settings(EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    @patch('eums.services.exporter.delivery_csv_exporter.AbstractCSVExporter.generate_exported_csv_file_name')
    def test_should_return_correct_notification_details_for_direct_delivery(self, mock_generate_exported_csv_file_name):
        file_name = 'direct_deliveries_1448892495779.csv'
        mock_generate_exported_csv_file_name.return_value = file_name
        category = 'delivery'
        warehouse_csv_export = DeliveryCSVExporter.create_delivery_exporter_by_type('Direct', HOSTNAME)
        details = ('Direct Delivery Download',
                   '%s some content Direct Delivery other content http://ha.ha/static/exports/' + category +
                   '/' + file_name)
        self.assertEqual(warehouse_csv_export.notification_details(), details)
