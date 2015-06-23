from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.api.api_test_helpers import create_sales_order_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'sales-order-item/'
PO_ITEM_FOR_SO_ITEM_ENDPOINT_URL = BACKEND_URL + 'so-item-po-item/'


class SalesOrderItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_sales_order(self):
        item = ItemFactory()
        sales_order = SalesOrderFactory()
        sales_order_item_details = {'sales_order': sales_order.id, 'item': item.id, 'quantity': 23,
                                    'net_price': 12000.0, 'net_value': 100.0, 'issue_date': '2014-01-21',
                                    'delivery_date': '2014-01-21', 'item_number': 10}

        created_sales_order_item = create_sales_order_item(self, sales_order_item_details)

        self.assertDictContainsSubset(sales_order_item_details, created_sales_order_item)
        self.assertDictContainsSubset({'distributionplannode_set': []}, created_sales_order_item)
