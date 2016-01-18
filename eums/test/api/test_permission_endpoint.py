from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from mock import patch

from eums.models import Consignee
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'permission/'


class CheckPermissionEndpointTest(AuthenticatedAPITestCase):

    def setUp(self):
        self.content_type = ContentType.objects.get_for_model(Consignee)
        self.permission_one = Permission.objects.create(
            codename='can_do_something_1',
            name='Can Do Something 1',
            content_type=self.content_type)

        user = User.objects.create_user(username='some_name', email='some@email.com', password='test')
        group = Group.objects.create(name='Some Group Name')
        user.groups = [group]
        user.save()
        group.permissions = [self.permission_one]
        group.save()

        self.client.login(username='some_name', password='test')

    def test_should_200_if_user_has_permission(self):
        response = self.client.get(ENDPOINT_URL + '?permission=eums.%s'%self.permission_one.codename, format='json')

        self.assertEqual(response.status_code, 200)

    def test_should_401_if_user_does_not_have_permission(self):
        self.permission_two = Permission.objects.create(
            codename='can_do_something_2',
            name='Can Do Something 2',
            content_type=self.content_type)

        response = self.client.get(ENDPOINT_URL + '?permission=eums.%s'%self.permission_two.codename, format='json')

        self.assertEqual(response.status_code, 401)

    @patch('django.contrib.auth.models.User.has_perm')
    def test_should_401_if_any_non_sense_exception(self, mock_has_perm):
        mock_has_perm.side_effect = StandardError
        response = self.client.get(ENDPOINT_URL + '?permission=this.does_not_exist', format='json')
        self.assertEqual(response.status_code, 401)


class PermissionEndpointTest(AuthenticatedAPITestCase):

    def test_should_return_permissions_for_a_user(self):
        content_type = ContentType.objects.get_for_model(Consignee)
        permission_one = Permission.objects.create(
            codename='can_do_something_1',
            name='Can Do Something 1',
            content_type=content_type)
        permission_two = Permission.objects.create(
            codename='can_do_something_2',
            name='Can Do Something 2',
            content_type=content_type)

        user = User.objects.create_user(username='some_name', email='some@email.com', password='test')
        group = Group.objects.create(name='Some Group Name')
        user.groups = [group]
        user.save()
        group.permissions = [permission_one, permission_two]
        group.save()

        self.client.login(username='some_name', password='test')
        response = self.client.get(ENDPOINT_URL + 'all', format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertIn('eums.' + permission_one.codename, response.data)
        self.assertIn('eums.' + permission_two.codename, response.data)

    def test_should_not_return_permissions_not_associated_to_logged_in_user(self):
        content_type = ContentType.objects.get_for_model(Consignee)
        permission_one = Permission.objects.create(
            codename='can_do_something_1',
            name='Can Do Something 1',
            content_type=content_type)
        permission_two = Permission.objects.create(
            codename='can_do_something_2',
            name='Can Do Something 2',
            content_type=content_type)

        user_one = User.objects.create_user(username='name_one', email='some_one@email.com', password='test')
        group_one = Group.objects.create(name='Group Name One')
        user_one.groups = [group_one]
        user_one.save()
        group_one.permissions = [permission_one]
        group_one.save()

        user_two = User.objects.create_user(username='name_two', email='some_two@email.com', password='test')
        group_two = Group.objects.create(name='Group Name Two')
        user_two.groups = [group_two]
        user_two.save()
        group_two.permissions = [permission_two]
        group_two.save()

        self.client.login(username='name_two', password='test')
        response = self.client.get(ENDPOINT_URL + 'all', format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, ['eums.' + permission_two.codename])
