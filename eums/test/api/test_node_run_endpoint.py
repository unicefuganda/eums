from eums.test.api.api_test_helpers import create_node_run
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory


ENDPOINT_URL = BACKEND_URL + 'node-run/'


class NodeRunTest(AuthenticatedAPITestCase):
    def test_should_create_node_run(self):
        node = DistributionPlanNodeFactory()

        node_run_details = {'scheduled_message_task_id': '33hd762',
                                      'node': node.id,
                                      'status': "completed", 'phone': '+256783123456'}

        created_node_run = create_node_run(self, node_run_details)

        self.assertDictContainsSubset(node_run_details, created_node_run)