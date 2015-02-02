from eums.test.api.api_test_helpers import create_item_unit, create_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'item/'


class ItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_item(self):
        unit = create_item_unit(self)
        item_details = {'description': "Item 1", 'unit': unit['id'], 'material_code': "Item Code 1"}

        response = self.client.post(ENDPOINT_URL, item_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(item_details, response.data)

    def test_should_get_items_sorted_by_description(self):
        unit = create_item_unit(self)
        item_one_details = {'description': "B Item", 'unit': unit['id'], 'material_code': "Item Code B"}
        item_two_details = {'description': "A Item", 'unit': unit['id'], 'material_code': "Item Code A"}

        create_item(self, item_one_details)
        create_item(self, item_two_details)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(item_two_details, get_response.data[0])
        self.assertDictContainsSubset(item_one_details, get_response.data[1])

