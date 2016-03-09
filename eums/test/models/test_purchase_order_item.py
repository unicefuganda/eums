from unittest import TestCase
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class PurchaseOrderItemTest(TestCase):
    def test_should_show_total_quantity_as_balance_when_no_nodes_exist(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(
                purchase_order=purchase_order,
                quantity=500)
        self.assertEquals(purchase_order_item.available_balance(), 500)

    def test_should_decrease_balance_when_saving_tracked_or_not_tracked_nodes(self):
        purchase_order_item = PurchaseOrderItemFactory(quantity=500)

        delivery = DeliveryFactory()
        DeliveryNodeFactory(item=purchase_order_item, quantity=200, distribution_plan=delivery)
        self.assertEquals(purchase_order_item.available_balance(), 300)
        self.assertEquals(purchase_order_item.quantity_shipped(), 200)

        delivery.track = True
        delivery.save()
        self.assertEquals(purchase_order_item.available_balance(), 300)
        self.assertEquals(purchase_order_item.quantity_shipped(), 200)

        tracked_delivery = DeliveryFactory(track=True)
        DeliveryNodeFactory(item=purchase_order_item, quantity=120, distribution_plan=tracked_delivery)
        self.assertEquals(purchase_order_item.available_balance(), 180)
        self.assertEquals(purchase_order_item.quantity_shipped(), 320)

    def test_should_only_include_top_level_nodes_when_calculating_available_balance(self):
        purchase_order_item = PurchaseOrderItemFactory(quantity=500)

        root_one = DeliveryNodeFactory(item=purchase_order_item, quantity=200,
                                       distribution_plan=DeliveryFactory(track=True))
        self.assertEquals(purchase_order_item.available_balance(), 300)

        DeliveryNodeFactory(item=purchase_order_item, parents=[(root_one, 120)],
                            distribution_plan=DeliveryFactory(track=True))
        self.assertEquals(purchase_order_item.available_balance(), 300)

    def test_should_return_type(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        self.assertEqual(purchase_order_item.type(), "Purchase Order")
