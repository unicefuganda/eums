from django.test import TestCase


class HomeViewTestCase(TestCase):
    def test_get_redirects_to_login_if_user_is_not_logged_in(self):
        response = self.client.get('/')
        self.assertEqual(302, response.status_code)
        response = self.client.get('/', follow=True)
        self.assertEqual(200, response.status_code)
        templates = [template.name for template in response.templates]
        self.assertIn('registration/login.html', templates)



