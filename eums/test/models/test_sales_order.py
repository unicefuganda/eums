from unittest import TestCase
from django.db import IntegrityError

from eums.models import SalesOrder
from eums.test.factories.sales_order_factory import SalesOrderFactory


class SalesOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_sales_order = [field for field in SalesOrder._meta._name_map]

        self.assertEquals(len(SalesOrder._meta.fields), 5)

        for field in ['order_number', 'programme', 'date', 'description']:
            self.assertIn(field, fields_in_sales_order)

    def test_no_two_sales_orders_should_have_the_same_order_number(self):
        self.create_sales_order()
        self.assertRaises(IntegrityError, self.create_sales_order)

    def create_sales_order(self):
        SalesOrderFactory(order_number=123)