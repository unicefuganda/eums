from unittest import TestCase
from eums.models.purchase_order_item import PurchaseOrderItem


class PurchaseOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = PurchaseOrderItem._meta._name_map
        for field in ['purchase_order_id', 'sales_order_item_id', 'item_number']:
            self.assertIn(field, fields_in_item)