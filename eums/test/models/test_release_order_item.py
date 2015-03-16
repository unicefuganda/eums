from unittest import TestCase
from eums.models.release_order_item import ReleaseOrderItem


class ReleaseOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in ReleaseOrderItem._meta._name_map]

        self.assertEquals(len(ReleaseOrderItem._meta.fields), 7)

        for field in ['release_order_id', 'item_id', 'item_number', 'quantity', 'value', 'purchase_order_item_id']:
            self.assertIn(field, fields_in_order)
