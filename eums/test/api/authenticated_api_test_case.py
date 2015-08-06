from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from eums.models import UserProfile


class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        log_test_user_in(self)

    def log_consignee_in(self, consignee):
        user = User.objects.create_user(username='test_consignee', email='someconignee@email.com', password='test')
        user.save()
        UserProfile.objects.create(user=user, consignee=consignee)
        self.client.login(username='test_consignee', password='test')

    def logout(self):
        self.client.logout()


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')
