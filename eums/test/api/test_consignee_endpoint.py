from rest_framework.test import APITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'consignee/'


class ConsigneeEndpointTest(APITestCase):
    def test_should_create_consignee(self):
        consignee_details = {'name': "Save the Children", 'contact_person_id': u'1234'}

        response, _ = self.create_consignee()

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(consignee_details, response.data)

    def test_should_get_consignee(self):
        response, consignee_details = self.create_consignee()

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(consignee_details, get_response.data[0])

    def create_consignee(self, consignee_details=None):
        if not consignee_details:
            consignee_details = {'name': "Save the Children", 'contact_person_id': u'1234'}
        response = self.client.post(ENDPOINT_URL, consignee_details, format='json')
        return response, consignee_details