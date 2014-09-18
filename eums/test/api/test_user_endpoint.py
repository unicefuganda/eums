from django.contrib.auth.models import User

from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_user
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'user/'


class UserEndPointTest(APITestCase):
    def test_should_create_user(self):
        user_details = {
            'username': 'test_user', 'first_name': 'test',
            'last_name': 'user', 'email': 'test@email.com'}
        user = create_user(self, user_details)

        self.assertDictContainsSubset(user_details, user)

    def tearDown(self):
        users = User.objects.all()
        for user in users:
            user.delete()

