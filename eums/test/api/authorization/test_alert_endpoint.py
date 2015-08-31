from eums.models import ReleaseOrderItem
from eums.models.alert import Alert
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.runnable_factory import RunnableFactory

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
