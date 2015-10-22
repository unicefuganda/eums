from unittest import TestCase
from eums.models.release_order_item import ReleaseOrderItem
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class ReleaseOrderItemTest(TestCase):
    def test_should_return_type(self):
        release_order = ReleaseOrderFactory()
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        self.assertEqual(release_order_item.type(), "Waybill")