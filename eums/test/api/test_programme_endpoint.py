
from rest_framework.test import APITestCase
from eums.test.api.api_test_helpers import create_user

from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'programme/'


class ProgrammeEndPointTest(APITestCase):
    def test_should_create_programme(self):
        focal_person = create_user(self)
        programme_details = {'name': "Programme 1", 'focal_person': focal_person['id']}
        response = self.client.post(ENDPOINT_URL, programme_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(programme_details, response.data)