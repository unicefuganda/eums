from eums.test.api.api_test_helpers import create_purchase_order, create_release_order
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'purchase-order/'


class PurchaseOrderEndPointTest(AuthenticatedAPITestCase):

    def test_should_get_purchase_orders_without_release_orders(self):
        created_purchase_order = create_purchase_order(self)
        create_release_order(self)

        response = self.client.get(ENDPOINT_URL+'for_direct_delivery/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data, [created_purchase_order])
        self.assertDictContainsSubset(created_purchase_order, response.data[0])

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
