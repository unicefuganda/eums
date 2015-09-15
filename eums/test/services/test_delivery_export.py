from unittest import TestCase

from mock import patch
from django.test import override_settings

from eums.models import DistributionPlanNode, PurchaseOrderItem, PurchaseOrder
from eums.services.delivery_csv_export import DeliveryExportFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


HOSTNAME = "http://ha.ha"
EMAIL_NOTIFICATION_CONTENT = "%s some content {0} other content {1}"


class WareHouseDeliveryExportTest(TestCase):

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

        header = [
            'Waybill', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked']
        row_one = [waybill, mama_kit, material_code, 10, delivery_date, consignee_name,
                   '%s %s' % (contact['firstName'], contact['lastName']),
                   contact['phone'], luweero, 'Yes', 'No']

        expected_data = [header, row_one]

        csv_exporter = DeliveryExportFactory.create('Warehouse', HOSTNAME)

        self.assertEqual(csv_exporter.data(), expected_data)

    @override_settings(EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    def test_should_return_correct_notification_details_for_warehouse_delivery(self):
        warehouse_csv_export = DeliveryExportFactory.create('Warehouse', HOSTNAME)
        details = ('Warehouse Delivery Download',
                   '%s some content Warehouse other content http://ha.ha/static/exports/warehouse_deliveries.csv')
        self.assertEqual(warehouse_csv_export.notification_details(), details)


class DirectDeliveryExportTest(TestCase):

    def tearDown(self):
        DistributionPlanNode.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        PurchaseOrder.objects.all().delete()

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_get_export_list_for_direct_delivery(self, mock_build_contact):
        contact = {'firstName': 'John', 'lastName': 'Ssenteza', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact
        delivery = DeliveryFactory(track=True)
        consignee_name = 'the consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        order_number = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 33'
        ro_item = PurchaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                           purchase_order=PurchaseOrderFactory(order_number=order_number))
        delivery_date = '2015-09-06'
        luweero = 'Luweero'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=luweero)

        header = [
            'Purchase Order Number', 'Item Description', 'Material Code', 'Quantity Shipped', 'Shipment Date',
            'Implementing Partner', 'Contact Person', 'Contact Number', 'District', 'Is End User',
            'Is Tracked']
        row_one = [order_number, mama_kit, material_code, 10, delivery_date, consignee_name,
                   '%s %s' % (contact['firstName'], contact['lastName']),
                   contact['phone'], luweero, 'Yes', 'No']

        expected_data = [header, row_one]

        csv_exporter = DeliveryExportFactory.create('Direct', HOSTNAME)

        self.assertEqual(csv_exporter.data(), expected_data)

    @override_settings(EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    def test_should_return_correct_notification_details_for_direct_delivery(self):
        warehouse_csv_export = DeliveryExportFactory.create('Direct', HOSTNAME)
        details = ('Direct Delivery Download',
                   '%s some content Direct other content http://ha.ha/static/exports/direct_deliveries.csv')
        self.assertEqual(warehouse_csv_export.notification_details(), details)
