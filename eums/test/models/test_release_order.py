from unittest import TestCase
from django.db import IntegrityError
from eums.models.release_order import ReleaseOrder
from eums.test.factories.release_order_factory import ReleaseOrderFactory


class ReleaseOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in ReleaseOrder._meta._name_map]

        self.assertEquals(len(ReleaseOrder._meta.fields), 7)

        for field in ['order_number', 'waybill', 'delivery_date', 'sales_order_id', 'purchase_order_id', 'consignee_id']:
            self.assertIn(field, fields_in_order)

    def test_no_two_release_orders_should_have_the_same_order_number(self):
        create_release_order = lambda: ReleaseOrderFactory(order_number=1234)
        create_release_order()
        self.assertRaises(IntegrityError, create_release_order)