import logging

from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.auth import *
from eums.models import UserProfile
from eums.test.api.api_test_helpers import create_user_with_group
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase

logger = logging.getLogger(__name__)

UNICEF_ADMIN = {'username': 'admin', 'password': 'admin'}
UNICEF_EDITOR = {'username': 'unicef_editor', 'password': 'wakiso'}
UNICEF_VIEWER = {'username': 'unicef_viewer', 'password': 'wakiso'}
IP_EDITOR = {'username': 'ip_editor', 'password': 'wakiso'}
IP_VIEWER = {'username': 'ip_viewer', 'password': 'wakiso'}


class AuthenticatedAPITestCase(PermissionsTestCase):
    def setUp(self):
        log_test_user_in(self)

    def log_consignee_in(self, consignee):
        user = User.objects.create_user(username='test_consignee', email='someconignee@email.com', password='test')
        user.save()
        UserProfile.objects.create(user=user, consignee=consignee)
        self.client.login(username='test_consignee', password='test')

    def log_unicef_admin_in(self):
        create_user_with_group(username=UNICEF_ADMIN['username'],
                               password=UNICEF_ADMIN['password'],
                               email='unicef_admin@mail.com',
                               group=GROUP_UNICEF_ADMIN)

        self.client.login(username=UNICEF_ADMIN['username'], password=UNICEF_ADMIN['password'])

    def log_unicef_editor_in(self):
        create_user_with_group(username=UNICEF_EDITOR['username'],
                               password=UNICEF_EDITOR['password'],
                               email='unicef_editor@mail.com',
                               group=GROUP_UNICEF_EDITOR)

        self.client.login(username=UNICEF_EDITOR['username'], password=UNICEF_EDITOR['password'])

    def log_unicef_viewer_in(self):
        create_user_with_group(username=UNICEF_VIEWER['username'],
                               password=UNICEF_VIEWER['password'],
                               email='unicef_viewer@mail.com',
                               group=GROUP_UNICEF_VIEWER)

        self.client.login(username=UNICEF_VIEWER['username'], password=UNICEF_VIEWER['password'])

    def log_ip_editor_in(self):
        create_user_with_group(username=IP_EDITOR['username'],
                               password=IP_EDITOR['password'],
                               email='ip_editor@mail.com',
                               group=GROUP_IP_EDITOR)

        self.client.login(username=IP_EDITOR['username'], password=IP_EDITOR['password'])

    def log_ip_viewer_in(self):
        create_user_with_group(username=IP_VIEWER['username'],
                               password=IP_VIEWER['password'],
                               email='ip_viewer@mail.com',
                               group=GROUP_IP_VIEWER)

        self.client.login(username=IP_VIEWER['username'], password=IP_VIEWER['password'])

    def logout(self):
        self.client.logout()


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')
