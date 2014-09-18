from rest_framework.test import APITestCase
from eums.test.api.api_test_helpers import create_item_unit

from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'item-unit/'


class ItemUnitEndPointTest(APITestCase):
    def test_should_create_item_unit(self):
        item_unit_details = {'name': "EA"}
        created_item_unit = create_item_unit(self, item_unit_details)

        self.assertDictContainsSubset(item_unit_details, created_item_unit)