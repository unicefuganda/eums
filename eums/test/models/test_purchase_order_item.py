from unittest import TestCase
from eums.models.purchase_order_item import PurchaseOrderItem
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory


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

    def test_balance_should_decrease_when_nodes_exist(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(
            purchase_order=purchase_order,
            quantity=500)
        NodeFactory(item=purchase_order_item, targeted_quantity=200)
        NodeFactory(item=purchase_order_item, targeted_quantity=120)
        self.assertEquals(purchase_order_item.available_balance(), 180)

