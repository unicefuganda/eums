from eums.models import ReleaseOrderItem, Flow, Runnable, Question
from eums.models.alert import Alert
from eums.models.system_settings import SystemSettings
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.answer_factory import TextAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.question_factory import TextQuestionFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.system_settings_factory import SystemSettingsFactory

ENDPOINT_URL = BACKEND_URL + 'system-settings/'


class SystemSettingsTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(SystemSettingsTest, self).setUp()

    def tearDown(self):
        SystemSettings.objects.all().delete()

    def test_turn_on_auto_track_should_display_all_warehouse_deliveries_on_ip_dashboard(self):
        SystemSettingsFactory(auto_track=False)
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        first_settings = response.data[0]
        self.assertIsNotNone(first_settings.get('auto_track'))
