from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'ip-feedback-report/'

class IpFeedbackReportEndPointTest(AuthenticatedAPITestCase):
    def test_returns_401_unless_admin(self):
        consignee = ConsigneeFactory()
        self.logout()
        self.log_consignee_in(consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 401)

    def test_returns_200_when_admin(self):
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
