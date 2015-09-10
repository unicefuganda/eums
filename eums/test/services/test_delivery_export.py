from unittest import TestCase

from mock import patch
from eums.models import DistributionPlanNode, ReleaseOrderItem
from eums.services.delivery_csv_export import DeliveryCSVExport
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from django.test import override_settings


HOSTNAME = "ha.ha"
EMAIL_NOTIFICATION_CONTENT = "%s some content {0} other content"


class ExportServiceTest(TestCase):

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

        csv_exporter = DeliveryCSVExport('Warehouse')

        self.assertEqual(csv_exporter.data(), expected_data)

    @override_settings(HOSTNAME=HOSTNAME, EMAIL_NOTIFICATION_CONTENT=EMAIL_NOTIFICATION_CONTENT)
    def test_should_return_correct_notification_details_for_warehouse_delivery(self):
        warehouse_csv_export = DeliveryCSVExport('Warehouse')
        details = ('Warehouse Delivery Download',
                   '%s some content http://ha.ha/static/exports/warehouse_deliveries.csv other content')
        self.assertEqual(warehouse_csv_export.notification_details(), details)
