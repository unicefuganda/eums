from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_item, create_sales_order
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'sales-order/'


class SalesOrderEndPointTest(APITestCase):
    def test_should_create_sales_order(self):
        sales_order_details = {'order_number': "25432SW"}

        response = self.client.post(ENDPOINT_URL, sales_order_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(sales_order_details, response.data)