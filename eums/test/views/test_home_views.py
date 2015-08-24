from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from eums.models import UserProfile


class HomeViewTestCase(TestCase):
    def test_get_redirects_to_login_if_user_is_not_logged_in(self):
        response = self.client.get('/')
        self.assertEqual(302, response.status_code)
        response = self.client.get('/', follow=True)
        self.assertEqual(200, response.status_code)
        templates = [template.name for template in response.templates]
        self.assertIn('registration/login.html', templates)

    def create_user(self, username="user", password="pass", permission="can_view_dashboard"):
        user = User.objects.create_user(username=username, email="user@mail.com", password=password)
        UserProfile.objects.create(user=user)
        auth_content = ContentType.objects.get_for_model(Permission)
        group = Group.objects.get_or_create(name="Group with %s permissions" % permission)[0]
        permission, out = Permission.objects.get_or_create(codename=permission, content_type=auth_content)
        group.permissions.add(permission)
        user.groups.add(group)
        return user

    def test_home_page(self):
        username = "user"
        password = "pass"
        permission = "can_view_dashboard"

        self.create_user(username, password, permission)

        self.client.login(username=username, password=password)

        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "index.html")
