from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.sales_order_factory import SalesOrderFactory

ENDPOINT_URL = BACKEND_URL + 'sales-order/'


class SalesOrderEndPointTest(AuthenticatedAPITestCase):
    def test_should_get_sales_orders(self):
        sales_order = SalesOrderFactory()
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(sales_order.id, response.data[0]['id'])
