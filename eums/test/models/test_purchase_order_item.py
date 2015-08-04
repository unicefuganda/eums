from unittest import TestCase
from eums.models.purchase_order_item import PurchaseOrderItem
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as NodeFactory


class PurchaseOrderItemTest(TestCase):

    def test_should_have_all_expected_fields(self):
        fields_in_item = PurchaseOrderItem._meta._name_map
        for field in ['purchase_order_id', 'sales_order_item_id', 'item_number']:
            self.assertIn(field, fields_in_item)

    def test_should_show_total_quantity_as_balance_when_no_nodes_exist(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(
            purchase_order=purchase_order,
            quantity=500)
        self.assertEquals(purchase_order_item.available_balance(), 500)

    def test_balance_should_decrease_when_tracked_nodes_exist(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order, quantity=500)

        node_one = NodeFactory(item=purchase_order_item, quantity=200)
        self.assertEquals(purchase_order_item.available_balance(), 500)

        node_one.track = True
        node_one.save()
        self.assertEquals(purchase_order_item.available_balance(), 300)

        NodeFactory(item=purchase_order_item, quantity=120, track=True)
        self.assertEquals(purchase_order_item.available_balance(), 180)

