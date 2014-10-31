from eums.test.api.api_test_helpers import create_item, create_sales_order, create_sales_order_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'sales-order-item/'


class SalesOrderEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_sales_order(self):
        item = create_item(self)
        sales_order = create_sales_order(self)

        sales_order_details = {'sales_order': sales_order['id'], 'item': item['id'], 'quantity': 23,
                               'net_price': 12000.0, 'net_value': 100.0, 'issue_date': '2014-01-21',
                               'delivery_date': '2014-01-21'}

        created_sales_order = create_sales_order_item(self, sales_order_details)

        self.assertDictContainsSubset(sales_order_details, created_sales_order)
        self.assertDictContainsSubset({'distributionplanlineitem_set': []}, created_sales_order)