from unittest import TestCase

from eums.models import SalesOrderItem
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class SalesOrderItemTest(TestCase):
    def test_should_get_first_related_purchase_order_item(self):
        sales_order_item = SalesOrderItemFactory()
        purchase_order_item = PurchaseOrderItemFactory(sales_order_item=sales_order_item)
        PurchaseOrderItemFactory(sales_order_item=sales_order_item)
        self.assertEqual(sales_order_item.purchase_order_item(), purchase_order_item)