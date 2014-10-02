from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_item, create_sales_order
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'sales-order/'


class SalesOrderEndPointTest(APITestCase):
    def test_should_create_sales_order(self):
        item = create_item(self)

        sales_order_details = {'order_number': "25432SW", 'item': item['id'], 'quantity': 23, 'net_price': 12000.0,
                               'net_value': 100.0, 'issue_date': '2014-01-21',
                               'delivery_date': '2014-01-21'}

        created_sales_order = create_sales_order(self, sales_order_details)

        self.assertDictContainsSubset(sales_order_details, created_sales_order)