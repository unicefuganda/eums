from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from eums.models import UserProfile


class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        log_test_user_in(self)

    def log_consignee_in(self, consignee, group_name):
        user = User.objects.create_user(username='testconignee',
                                        email='someconignee@email.com',
                                        password='test')
        user.user_groups = [Group.objects.get(name=group_name)]
        user.save()
        UserProfile.objects.create(user=user, consignee=consignee)
        self.client.login(username='testconignee', password='test')

    def log_user_out(self):
        self.client.logout()


def log_test_user_in(test_case):
    User.objects.create_superuser(username='test', email='some@email.com', password='test')
    test_case.client.login(username='test', password='test')
