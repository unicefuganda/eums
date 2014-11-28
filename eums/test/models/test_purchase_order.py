from unittest import TestCase
from eums.models.purchase_order import PurchaseOrder


class PurchaseOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = PurchaseOrder._meta._name_map
        for field in ['order_number', 'sales_order_id']:
            self.assertIn(field, fields_in_item)