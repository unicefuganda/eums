from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_200_OK

from eums.models import Flow
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.flow_factory import FlowFactory

ENDPOINT_URL = BACKEND_URL + 'alert/'


class AlertEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        FlowFactory(label=Flow.Label.IMPLEMENTING_PARTNER)
        FlowFactory(label=Flow.Label.END_USER)
        FlowFactory(label=Flow.Label.MIDDLE_MAN)
        super(AlertEndpointTest, self).setUp()

    def test_unicef_admin_should_have_permission_to_view_alert(self):
        self.log_and_assert_view_alert_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_have_permission_to_view_alert(self):
        self.log_and_assert_view_alert_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_have_permission_to_view_alert(self):
        self.log_and_assert_view_alert_permission(self.log_unicef_viewer_in, HTTP_200_OK)

    def test_ip_editors_should_not_have_permission_to_view_alert(self):
        self.log_and_assert_view_alert_permission(self.log_ip_editor_in, HTTP_403_FORBIDDEN)

    def test_ip_viewers_should_not_have_permission_to_view_alert(self):
        self.log_and_assert_view_alert_permission(self.log_ip_viewer_in, HTTP_403_FORBIDDEN)

    def log_and_assert_view_alert_permission(self, log_func, status_code):
        log_func()
        self.assertEqual(self.client.get(ENDPOINT_URL).status_code, status_code)

    def test_unicef_admin_should_have_permission_to_change_alert(self):
        self.log_and_assert_change_alert_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_have_permission_to_change_alert(self):
        self.log_and_assert_change_alert_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_have_permission_to_change_alert(self):
        self.log_and_assert_change_alert_permission(self.log_unicef_viewer_in, HTTP_403_FORBIDDEN)

    def test_ip_editors_should_not_have_permission_to_change_alert(self):
        self.log_and_assert_change_alert_permission(self.log_ip_editor_in, HTTP_403_FORBIDDEN)

    def test_ip_viewers_should_not_have_permission_to_change_alert(self):
        self.log_and_assert_change_alert_permission(self.log_ip_viewer_in, HTTP_403_FORBIDDEN)

    def log_and_assert_change_alert_permission(self, log_func, status_code):
        log_func()

        alert = AlertFactory()
        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id),
                                     data={'remarks': 'hello world', 'is_resolved': True})

        self.assertEqual(response.status_code, status_code)

    def test_admin_should_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_consignee_should_not_view_alert(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_admin_should_update_alert(self):
        PermissionsTestCase.setUpClass()
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id),
                                     data={'remarks': 'hello world', 'is_resolved': True})

        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_consignee_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_consignee_in(ConsigneeFactory())

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, 'someId'),
                                     data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)

    def test_unicef_viewer_should_not_update_alert(self):
        PermissionsTestCase.setUpClass()
        AlertFactory()

        self.logout()
        self.log_unicef_viewer_in()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, 'someId'),
                                     data={'id': 'someId', 'remarks': 'hello world'})

        self.assertEqual(response.status_code, HTTP_403_FORBIDDEN)
