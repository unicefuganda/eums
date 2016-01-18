from rest_framework.test import APITestCase

from eums.test.api.authorization.authenticated_api_test_case import log_test_user_in
from eums.test.config import BACKEND_URL


class GeneralApiTest(APITestCase):
    def test_should_not_allow_unauthenticated_users_to_view_api(self):
        response = self.client.get(BACKEND_URL)
        self.assertEqual(response.status_code, 403)

    def test_should_allow_authenticated_users_to_view_api(self):
        log_test_user_in(self)
        response = self.client.get(BACKEND_URL)
        self.assertEqual(response.status_code, 200)