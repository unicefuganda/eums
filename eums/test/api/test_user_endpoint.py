from eums.test.api.api_test_helpers import create_user
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'user/'


class UserEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_user(self):
        user_details = {
            'username': 'test_user', 'first_name': 'test',
            'last_name': 'user', 'email': 'test@email.com'}
        user = create_user(self, user_details)

        self.assertDictContainsSubset(user_details, user)

