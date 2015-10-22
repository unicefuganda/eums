from unittest import TestCase
from eums.models.purchase_order_item import PurchaseOrderItem
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as NodeFactory


class PurchaseOrderItemTest(TestCase):

    def test_should_show_total_quantity_as_balance_when_no_nodes_exist(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(
            purchase_order=purchase_order,
            quantity=500)
        self.assertEquals(purchase_order_item.available_balance(), 500)

    def test_balance_should_decrease_when_tracked_nodes_exist(self):
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=(PurchaseOrderFactory()), quantity=500)

        node_one = NodeFactory(item=purchase_order_item, quantity=200)
        self.assertEquals(purchase_order_item.available_balance(), 500)

        node_one.track = True
        node_one.save()
        self.assertEquals(purchase_order_item.available_balance(), 300)

        NodeFactory(item=purchase_order_item, quantity=120, track=True)

        self.assertEquals(purchase_order_item.available_balance(), 180)

    def test_should_only_include_top_level_nodes_when_calculating_available_balance(self):
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=(PurchaseOrderFactory()), quantity=500)

        root_one = NodeFactory(item=purchase_order_item, quantity=200, track=True)
        self.assertEquals(purchase_order_item.available_balance(), 300)

        NodeFactory(item=purchase_order_item, parents=[(root_one, 120)], track=True)
        self.assertEquals(purchase_order_item.available_balance(), 300)

    def test_should_return_type(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        self.assertEqual(purchase_order_item.type(), "Purchase Order")