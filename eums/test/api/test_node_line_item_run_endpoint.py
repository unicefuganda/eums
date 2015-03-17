from eums.test.api.api_test_helpers import create_node_line_item_run
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'node-line-item-run/'


class NodeLineItemRunTest(AuthenticatedAPITestCase):
    def test_should_create_node_line_item_run(self):
        distribution_plan_line_item = DistributionPlanLineItemFactory()

        node_line_item_run_details = {'scheduled_message_task_id': '33hd762',
                                      'node_line_item': distribution_plan_line_item.id,
                                      'status': "completed", 'phone': '+256783123456'}

        created_node_line_item_run = create_node_line_item_run(self, node_line_item_run_details)

        self.assertDictContainsSubset(node_line_item_run_details, created_node_line_item_run)