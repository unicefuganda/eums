from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.models import UserProfile
from eums.test.api.api_test_helpers import create_user_with_group


class AuthenticatedAPITestCase(APITestCase):
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

    def logout(self):
        self.client.logout()


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')
