from eums.test.factories.user_factory import UserFactory
from rest_framework.test import APITestCase
from django.core.management import call_command
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from eums.models import Consignee, DistributionPlan, UserProfile
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'user/'


class UserEndpointTest(APITestCase):
    def setUp(self):
        call_command('setup_permissions')

    def tearDown(self):
        UserProfile.objects.all().delete()
        User.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlan.objects.all().delete()

    # UNICEF Admin

    def test_should_allow_unicef_admin_to_create_users(self):
        self._login_as('UNICEF_admin')
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_admin_to_view_users(self):
        user = UserFactory()
        self._login_as('UNICEF_admin')

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 200)

    def test_should_allow_unicef_admin_to_edit_users(self):
        user = UserFactory()
        self._login_as('UNICEF_admin')

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 200)

    # UNICEF editor

    def test_should_not_allow_unicef_editors_to_create_users(self):
        self._login_as('UNICEF_editor')
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def _test_should_not_allow_unicef_editors_to_view_users(self):
        user = UserFactory()
        self._login_as('UNICEF_editor')

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_editors_to_edit_users(self):
        user = UserFactory()
        self._login_as('UNICEF_editor')

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 403)

    # UNICEF viewer

    def test_should_not_allow_unicef_viewers_to_create_users(self):
        self._login_as('UNICEF_viewer')
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def _test_should_not_allow_unicef_viewers_to_view_users(self):
        user = UserFactory()
        self._login_as('UNICEF_viewer')

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_viewers_to_edit_users(self):
        user = UserFactory()
        self._login_as('UNICEF_viewer')

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 403)

    # Helper methods

    def _login_as(self, group_name):
        self._associate_group_with_user(group_name, 'some_user_name', 'pass')
        self.client.login(username='some_user_name', password='pass')

    def _associate_group_with_user(self, group_name, username, password):
        user = User.objects.create_user(username=username, email='user@email.com', password=password)
        user.groups = [Group.objects.get(name=group_name)]
        user.save()

