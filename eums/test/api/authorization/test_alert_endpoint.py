from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.consignee_factory import ConsigneeFactory

ENDPOINT_URL = BACKEND_URL + 'alert/'


class AlertEndpointTest(AuthenticatedAPITestCase):

    def test_admin_should_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

    def test_consignee_should_not_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 401)

    def test_admin_should_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        response = self.client.patch(ENDPOINT_URL, data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, 200)

    def test_consignee_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.patch(ENDPOINT_URL, data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, 401)

    def test_unicef_viewer_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_unicef_viewer_in()

        response = self.client.patch(ENDPOINT_URL, data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, 401)
