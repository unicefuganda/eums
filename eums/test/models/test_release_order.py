from unittest import TestCase
from eums.models.release_order import ReleaseOrder


class ReleaseOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = ReleaseOrder._meta._name_map
        for field in ['order_number', 'waybill', 'delivery_date', 'sales_order_id', 'consignee_id']:
            self.assertIn(field, fields_in_item)