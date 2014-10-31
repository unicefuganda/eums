from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.api.api_test_helpers import create_consignee
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'consignee/'


class ConsigneeEndpointTest(AuthenticatedAPITestCase):
    def test_should_create_consignee(self):
        consignee_details = {'name': "Save the Children", 'type': "implementing_partner"}

        created_consignee = create_consignee(self)

        self.assertDictContainsSubset(consignee_details, created_consignee)

    def test_should_get_consignee(self):
        consignee_details = create_consignee(self)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(consignee_details, get_response.data[0])