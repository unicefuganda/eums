from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_item_unit
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'item/'


class ProgrammeEndPointTest(APITestCase):
    def test_should_create_programme(self):
        unit = create_item_unit(self)
        item_details = {'description': "Item 1", 'unit': unit['id'], 'material_code': "Item Code 1"}

        response = self.client.post(ENDPOINT_URL, item_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(item_details, response.data)
