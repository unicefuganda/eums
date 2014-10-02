from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_sales_order, create_sales_order_with_more_info
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'sales-order/'


class SalesOrderEndPointTest(APITestCase):
    def test_should_create_sales_order(self):
        sales_order_details = {'order_number': "25432SW"}

        response = self.client.post(ENDPOINT_URL, sales_order_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(sales_order_details, response.data)

    def test_should_create_sales_order_with_more_information(self):
        sales_order_details = {'sales_document': '00001',
                               'material_code': '1234', 'order_quantity': '100',
                               'date_created': '2014-10-02',
                               'net_value': '1000', 'net_price': '10', 'description': 'Test'}

        created_sales_order = create_sales_order_with_more_info(self)

        self.assertDictContainsSubset(sales_order_details, created_sales_order)

    def test_should_get_sales_orders(self):
        created_sales_order = create_sales_order(self)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(created_sales_order, get_response.data[0])
