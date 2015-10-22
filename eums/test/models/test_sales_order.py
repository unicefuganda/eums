from unittest import TestCase

from django.db import IntegrityError
from eums.models import SalesOrder
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class SalesOrderTest(TestCase):
    def test_no_two_sales_orders_should_have_the_same_order_number(self):
        self.create_sales_order()
        self.assertRaises(IntegrityError, self.create_sales_order)

    def create_sales_order(self, order_number=123):
        return SalesOrderFactory(order_number=order_number)