import datetime
from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_programme, create_distribution_plan, create_distribution_plan_node, \
    create_consignee
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(APITestCase):
    def setUp(self):
        self.programme = create_programme()

    def test_should_create_distribution_plan(self):
        plan_details = {'programme': self.programme.id, 'name': 'Plan 1', 'date': datetime.date.today()}
        create_distribution_plan(self, plan_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def test_should_provide_distribution_plan_with_all_its_nodes(self):
        plan_id = create_distribution_plan(self)
        consignee = create_consignee(self)
        node_details = {'distribution_plan': plan_id, 'consignee': consignee['id'], 'tree_position': 'END_USER'}
        node = create_distribution_plan_node(self, node_details)
        expected_plan_partial = {'distributionplannode_set': [node['id']]}

        response = self.client.get("%s%d/" % (ENDPOINT_URL, plan_id))

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_plan_partial, response.data)