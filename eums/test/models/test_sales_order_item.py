from unittest import TestCase

from eums.models import SalesOrderItem


class SalesOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = SalesOrderItem()._meta._name_map

        for field in ['sales_order_id', 'item_id', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date',
                      'item_number']:
            self.assertIn(field, fields_in_item)