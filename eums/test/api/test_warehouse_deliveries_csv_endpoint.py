from eums.models import DistributionPlanNode
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from mock import patch


ENDPOINT_URL = BACKEND_URL + 'warehouse-deliveries-csv/'


class TestWarehouseDeliveriesCSVEndpoint(AuthenticatedAPITestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_retun_csv_with_warehouse_deliveries(self, mock_build_contact):
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

        expected_data = [
            {'Waybill': waybill, 'Quantity Shipped': 10, 'Item Description': unicode(mama_kit),
             'Material Code': material_code,
             'Shipment Date': unicode(delivery_date), 'Implementing Partner': unicode(consignee_name),
             'Contact Person': '%s %s' % (contact['firstName'], contact['lastName']),
             'Contact Number': contact['phone'], 'District': unicode(luweero), 'Is End User': 'Yes',
             'Is Tracked': 'No'}]

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        self.assertEqual(response.data, expected_data)

    @patch('eums.models.DistributionPlanNode.build_contact')
    def test_should_return_csv_with_warehouse_deliveries_only(self, mock_build_contact):
        order_number = 9023892
        jerrycans = 'Jerrycans'
        po_item = PurchaseOrderItemFactory(item=ItemFactory(description=jerrycans),
                                           purchase_order=PurchaseOrderFactory(order_number=order_number))
        DeliveryNodeFactory(item=po_item)

        contact = {'firstName': 'Paul', 'lastName': 'Mukasa', 'phone': '+256 782 123456'}
        mock_build_contact.return_value = contact

        delivery = DeliveryFactory(track=True)
        consignee_name = 'first consignee'
        consignee = ConsigneeFactory(name=consignee_name)
        waybill = 5404939
        basin = 'Basin'
        material_code = 'Code 3'
        ro_item = ReleaseOrderItemFactory(item=ItemFactory(description=basin, material_code=material_code),
                                          release_order=ReleaseOrderFactory(waybill=waybill))
        delivery_date = '2013-10-07'
        kampala = 'Kampala'
        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=delivery_date,
                            consignee=consignee, item=ro_item, location=kampala)

        expected_data = [
            {'Waybill': waybill, 'Quantity Shipped': 10, 'Item Description': unicode(basin),
             'Material Code': material_code,
             'Shipment Date': unicode(delivery_date), 'Implementing Partner': unicode(consignee_name),
             'Contact Person': '%s %s' % (contact['firstName'], contact['lastName']),
             'Contact Number': contact['phone'], 'District': unicode(kampala), 'Is End User': 'Yes',
             'Is Tracked': 'No'}]

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        self.assertEqual(response.data, expected_data)

