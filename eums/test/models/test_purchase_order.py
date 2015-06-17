from unittest import TestCase

from django.db import IntegrityError

from eums.models.purchase_order import PurchaseOrder
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class PurchaseOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in PurchaseOrder._meta._name_map]

        self.assertEquals(len(PurchaseOrder._meta.fields), 4)

        for field in ['order_number', 'sales_order', 'date']:
            self.assertIn(field, fields_in_order)

    def test_no_two_purchase_orders_should_have_the_same_order_number(self):
        create_purchase_order = lambda: PurchaseOrderFactory(order_number=1234)
        create_purchase_order()
        self.assertRaises(IntegrityError, create_purchase_order)

    def test_should_know_if_it_has_a_distribution_plan_or_not(self):
        purchase_order = PurchaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        self.assertFalse(purchase_order.has_plan())
        DistributionPlanNodeFactory(item=purchase_order_item)
        self.assertTrue(purchase_order.has_plan())
