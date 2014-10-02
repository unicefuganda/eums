from unittest import TestCase

from eums.models import SalesOrder


class ProgrammeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        sales_order = SalesOrder()
        fields_in_item = [field.attname for field in sales_order._meta.fields]

        for field in ['order_number', 'item_id', 'quantity', 'net_price', 'net_value', 'issue_date', 'delivery_date']:
            self.assertIn(field, fields_in_item)