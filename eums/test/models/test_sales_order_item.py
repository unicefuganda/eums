from unittest import TestCase

from eums.models import SalesOrderItem
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class SalesOrderItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = [field.attname for field in SalesOrderItem()._meta.fields]

        for field in ['id', 'sales_order_id', 'item_id', 'quantity', 'net_price', 'net_value', 'orderitem_ptr_id',
                      'issue_date', 'delivery_date', 'item_number', 'description', 'polymorphic_ctype_id']:
            self.assertIn(field, fields_in_item)
        self.assertEqual(len(fields_in_item), 12)

    def test_should_get_first_related_purchase_order_item(self):
        sales_order_item = SalesOrderItemFactory()
        purchase_order_item = PurchaseOrderItemFactory(sales_order_item=sales_order_item)
        PurchaseOrderItemFactory(sales_order_item=sales_order_item)
        self.assertEqual(sales_order_item.purchase_order_item(), purchase_order_item)