from unittest import TestCase

from eums.models import SalesOrderItem


class SalesOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        sales_order_item = SalesOrderItem()
        fields_in_item = [field.attname for field in sales_order_item._meta.fields]

        for field in ['sales_order_id', 'item_id', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date']:
            self.assertIn(field, fields_in_item)