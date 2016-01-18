from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'release-order-item/'


class ReleaseOrderItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_get_release_order(self):
        # TODO Implement this
        pass
