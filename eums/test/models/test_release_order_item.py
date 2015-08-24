from unittest import TestCase
from eums.models.release_order_item import ReleaseOrderItem
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class ReleaseOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in ReleaseOrderItem._meta._name_map]

        self.assertEquals(len(ReleaseOrderItem._meta.fields), 9)

        for field in ['release_order_id', 'item_id', 'item_number', 'quantity', 'value',
                      'purchase_order_item_id', 'polymorphic_ctype_id', 'orderitem_ptr_id']:
            self.assertIn(field, fields_in_order)

    def test_should_return_type(self):
        release_order = ReleaseOrderFactory()
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        self.assertEqual(release_order_item.type(), "Waybill")