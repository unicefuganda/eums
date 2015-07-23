from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        log_test_user_in(self)


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')