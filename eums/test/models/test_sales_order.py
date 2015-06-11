from unittest import TestCase

from django.db import IntegrityError
from eums.models import SalesOrder
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class SalesOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_sales_order = [field for field in SalesOrder._meta._name_map]

        self.assertEquals(len(SalesOrder._meta.fields), 5)

        for field in ['order_number', 'programme', 'date', 'description']:
            self.assertIn(field, fields_in_sales_order)

    def test_no_two_sales_orders_should_have_the_same_order_number(self):
        self.create_sales_order()
        self.assertRaises(IntegrityError, self.create_sales_order)

    def test_should_know_if_it_has_a_distribution_plan_or_not(self):
        sales_order = self.create_sales_order(order_number=21)
        sales_order_item = SalesOrderItemFactory(sales_order=sales_order)
        self.assertFalse(sales_order.has_plan())
        DistributionPlanNodeFactory(item=sales_order_item)
        self.assertTrue(sales_order.has_plan())

    def create_sales_order(self, order_number=123):
        return SalesOrderFactory(order_number=order_number)