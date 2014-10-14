from unittest import TestCase
from eums.models.release_order_item import ReleaseOrderItem


class ReleaseOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = ReleaseOrderItem._meta._name_map
        for field in ['release_order_id', 'item_id', 'quantity', 'value', 'purchase_order']:
            self.assertIn(field, fields_in_item)