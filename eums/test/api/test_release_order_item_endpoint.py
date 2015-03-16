from eums.test.api.api_test_helpers import create_release_order_item
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'release-order-item/'


class ReleaseOrderItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_release_order(self):
        item = ItemFactory()
        release_order = ReleaseOrderFactory()
        purchase_order_item = PurchaseOrderItemFactory()

        release_order_item_details = {'release_order': release_order.id, 'item': item.id, 'item_number': 10,
                                      'quantity': 23, 'value': 100.0, 'purchase_order_item': purchase_order_item.id}

        created_release_order_item = create_release_order_item(self, release_order_item_details)

        self.assertDictContainsSubset(release_order_item_details, created_release_order_item)