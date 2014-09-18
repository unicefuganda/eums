from rest_framework.test import APITestCase

from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'item-unit/'


class ItemUnitEndPointTest(APITestCase):
    def test_should_create_item_unit(self):
        item_details = {'name': "EA"}
        response = self.client.post(ENDPOINT_URL, item_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(item_details, response.data)