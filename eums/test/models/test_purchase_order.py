from unittest import TestCase

from django.db import IntegrityError

from eums.models import Consignee, DistributionPlanNode, SalesOrder
from eums.models.purchase_order import PurchaseOrder
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class PurchaseOrderTest(TestCase):
    def tearDown(self):
        SalesOrder.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in PurchaseOrder._meta._name_map]
        self.assertEquals(len(PurchaseOrder._meta.fields), 6)
        for field in ['order_number', 'sales_order', 'date', 'is_single_ip', 'po_type']:
            self.assertIn(field, fields_in_order)

    def test_no_two_purchase_orders_should_have_the_same_order_number(self):
        create_purchase_order = lambda: PurchaseOrderFactory(order_number=1234)
        create_purchase_order()
        self.assertRaises(IntegrityError, create_purchase_order)

    def test_should_know_if_it_has_a_distribution_plan_or_not(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        self.assertFalse(purchase_order.has_plan())
        NodeFactory(item=purchase_order_item)
        self.assertTrue(purchase_order.has_plan())

    def test_should_know_if_it_is_fully_delivered_or_not(self):
        consignee = ConsigneeFactory()
        purchase_order_one = PurchaseOrderFactory()
        purchase_order_two = PurchaseOrderFactory()
        purchase_order_three = PurchaseOrderFactory()

        purchase_order_item_one = PurchaseOrderItemFactory(purchase_order=purchase_order_one, quantity=100)
        self.assertFalse(purchase_order_one.is_fully_delivered())

        NodeFactory(item=purchase_order_item_one, consignee=consignee, targeted_quantity=50,
                    tree_position=DistributionPlanNode.END_USER)
        self.assertFalse(purchase_order_one.is_fully_delivered())

        purchase_order_item_two = PurchaseOrderItemFactory(purchase_order=purchase_order_two, quantity=100)
        NodeFactory(item=purchase_order_item_two, consignee=consignee, targeted_quantity=100,
                    tree_position=DistributionPlanNode.MIDDLE_MAN)
        self.assertFalse(purchase_order_two.is_fully_delivered())

        purchase_order_item_three = PurchaseOrderItemFactory(purchase_order=purchase_order_three, quantity=100)
        purchase_order_item_four = PurchaseOrderItemFactory(purchase_order=purchase_order_three, quantity=50)
        NodeFactory(item=purchase_order_item_three, consignee=consignee, targeted_quantity=100,
                    tree_position=DistributionPlanNode.END_USER)
        NodeFactory(item=purchase_order_item_four, consignee=consignee, targeted_quantity=50,
                    tree_position=DistributionPlanNode.END_USER)
        self.assertTrue(purchase_order_three.is_fully_delivered())

    def test_should_get_orders__as_a_queryset__whose_items_have_been_delivered_to_a_specific_consignee(self):
        consignee = ConsigneeFactory()
        order_one = PurchaseOrderFactory()
        order_two = PurchaseOrderFactory()
        order_three = PurchaseOrderFactory()
        order_item_one = PurchaseOrderItemFactory(purchase_order=order_one)
        order_item_two = PurchaseOrderItemFactory(purchase_order=order_two)
        NodeFactory(item=order_item_one, consignee=consignee)
        NodeFactory(item=order_item_two, consignee=consignee)

        consignee_orders = PurchaseOrder.objects.for_consignee(consignee.id).order_by('id')

        self.assertListEqual(list(consignee_orders), [order_one, order_two])
        self.assertNotIn(order_three, consignee_orders)
