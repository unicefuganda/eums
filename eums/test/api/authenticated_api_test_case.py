from django.contrib.auth.models import User
from eums.test.factories.flow_factory import FlowFactory
from rest_framework.test import APITestCase

from eums.models import UserProfile, Runnable
from eums.test.api.api_test_helpers import create_user_with_group


class AuthenticatedAPITestCase(APITestCase):
    UNICEF_ADMIN = {'username': 'admin', 'password': 'admin'}
    UNICEF_EDITOR = {'username': 'unicef_editor', 'password': 'wakiso'}
    UNICEF_VIEWER = {'username': 'unicef_viewer', 'password': 'wakiso'}
    IP_EDITOR = {'username': 'ip_editor', 'password': 'wakiso'}
    IP_VIEWER = {'username': 'ip_viewer', 'password': 'wakiso'}

    def setUp(self):
        log_test_user_in(self)

    def log_consignee_in(self, consignee):
        user = User.objects.create_user(username='test_consignee', email='someconignee@email.com', password='test')
        user.save()
        UserProfile.objects.create(user=user, consignee=consignee)
        self.client.login(username='test_consignee', password='test')

    def log_unicef_viewer_in(self):
        create_user_with_group(username='unicefviewer',
                               password='password',
                               email='unicef_viewer@mail.com',
                               group='UNICEF_viewer')

        self.client.login(username='unicefviewer', password='password')

    def log_ip_editor_in(self):
        username = 'ip_editor_1'
        password = 'ip_editor_1'
        create_user_with_group(username=username,
                               password=password,
                               email='ip@mail.com',
                               group='Implementing Partner_editor')

        self.client.login(username=username, password=password)

    def logout(self):
        self.client.logout()

    def login_and_assert_view_permission(self, login_user, url, status_code):
        self.logout()
        self.client.login(username=login_user['username'], password=login_user['password'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status_code)

    def login_and_assert_add_permission(self, login_user, url, status_code):
        self.logout()
        self.client.login(username=login_user['username'], password=login_user['password'])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status_code)


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')
