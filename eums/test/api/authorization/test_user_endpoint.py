from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.user_factory import UserFactory
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'user/'


class UserEndpointTest(AuthenticatedAPITestCase):
    def test_should_allow_unicef_admin_to_create_users(self):
        self.log_unicef_admin_in()
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_admin_to_view_users(self):
        user = UserFactory()
        self.log_unicef_admin_in()

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 200)

    def test_should_allow_unicef_admin_to_edit_users(self):
        user = UserFactory()
        self.log_unicef_admin_in()

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 200)

    def test_should_not_allow_unicef_editors_to_create_users(self):
        self.log_unicef_editor_in()
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_editors_to_view_users(self):
        user = UserFactory()
        self.log_unicef_editor_in()

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_editors_to_edit_users(self):
        user = UserFactory()
        self.log_unicef_editor_in()

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
        self.log_unicef_viewer_in()
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_viewers_to_view_users(self):
        user = UserFactory()
        self.log_unicef_viewer_in()

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_unicef_viewers_to_edit_users(self):
        user = UserFactory()
        self.log_unicef_viewer_in()

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 403)

    # Implementing partner editor

    def test_should_not_allow_implementing_partner_editors_to_create_users(self):
        self.log_ip_editor_in()
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_editors_to_view_users(self):
        user = UserFactory()
        self.log_ip_editor_in()

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_editors_to_edit_users(self):
        user = UserFactory()
        self.log_ip_editor_in()

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 403)

    # Implementing partner viewer

    def test_should_not_allow_implementing_partner_viewers_to_create_users(self):
        self.log_ip_viewer_in()
        response = self.client.post(ENDPOINT_URL,
                                    {'username': 'name', 'password': 'password',
                                     'email': 'email@email.email',
                                     'first_name': 'f name', 'last_name': 'l name'
                                     }
                                    )

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_viewers_to_view_users(self):
        user = UserFactory()
        self.log_ip_viewer_in()

        response = self.client.get(ENDPOINT_URL + str(user.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_viewers_to_edit_users(self):
        user = UserFactory()
        self.log_ip_viewer_in()

        response = self.client.put(ENDPOINT_URL + str(user.id) + '/', {
            'id': str(user.id),
            'username': 'newName',
            'email': 'email@email.email',
            'first_name': 'f name',
            'last_name': 'l name'
        })

        self.assertEqual(response.status_code, 403)
