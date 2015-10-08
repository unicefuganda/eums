from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'programme/'


class ProgrammeEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_programme(self):
        programme_details = {'name': "Programme 1"}
        response = self.client.post(ENDPOINT_URL, programme_details, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(programme_details, response.data)
