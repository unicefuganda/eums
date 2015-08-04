from eums.test.api.api_test_helpers import create_run
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


ENDPOINT_URL = BACKEND_URL + 'run/'


class RunTest(AuthenticatedAPITestCase):
    def test_should_create_run(self):
        node = DeliveryNodeFactory()

        run_details = {'scheduled_message_task_id': '33hd762',
                                      'runnable': node.id,
                                      'status': "completed", 'phone': '+256783123456'}

        created_run = create_run(self, run_details)

        self.assertDictContainsSubset(run_details, created_run)