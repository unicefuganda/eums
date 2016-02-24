import json

from django.contrib.auth.models import User, Group

from django.test import Client, TestCase

from eums.auth import GROUP_IP_EDITOR
from eums.models import UserProfile
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory

ENDPOINT_URL = BACKEND_URL + 'current-user'


class CurrentUserEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        self.client = Client()
        self.data = {
            "username": "username",
            "password": "password",
            "email": "haha@ha.ha",
            "first_name": "john",
            "last_name": "Bukoto",
        }
        self.user = User.objects.create_user(**self.data)
        self.user.groups = [Group.objects.get(name=GROUP_IP_EDITOR)]
        self.client.login(username=self.data['username'], password=self.data['password'])

    def test_should_get_current_user(self):
        consignee_id = 1
        UserProfile.objects.create(user=self.user, consignee=ConsigneeFactory(id=consignee_id))

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        expected_data = self.data.copy()
        expected_data.pop('password')
        expected_data['consignee_id'] = consignee_id
        expected_data['userid'] = self.user.id
        expected_data['group'] = GROUP_IP_EDITOR

        response_data = json.loads(response.content)
        self.assertEqual(response_data, expected_data)

    def test_should_send_none_for_consignee_id_if_no_consignee(self):
        UserProfile.objects.create(user=self.user)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        expected_data = self.data.copy()
        expected_data.pop('password')
        expected_data['consignee_id'] = None
        expected_data['userid'] = self.user.id
        expected_data['group'] = GROUP_IP_EDITOR

        response_data = json.loads(response.content)
        self.assertEqual(response_data, expected_data)
