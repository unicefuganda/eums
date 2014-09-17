from rest_framework.test import APITestCase

from eums.test.api.test_distribution_plan_endpoint import create_distribution_plan
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DistributionPlanNodeEndpoint(APITestCase):
    def test_should_create_distribution_plan_node_without_parent_node(self):
        plan_id = create_distribution_plan(self)
        node_details = {'distribution_plan': plan_id}

        created_node_data = self.create_distribution_plan_node(node_details)

        self.assertDictContainsSubset(node_details, created_node_data)

    def test_should_create_distribution_plan_node_with_parent_node(self):
        parent_node = self.create_distribution_plan_node()
        plan_id = create_distribution_plan(self)
        child_node_data = {'distribution_plan': plan_id, 'parent': parent_node['id']}

        created_node_details = self.create_distribution_plan_node(child_node_data)

        self.assertDictContainsSubset(child_node_data, created_node_details)

    def test_should_get_distribution_plan_node_with_children(self):
        pass

    def create_distribution_plan_node(self, node_details=None):
        plan_id = create_distribution_plan(self)
        if not node_details:
            node_details = {'distribution_plan': plan_id}

        response = self.client.post(ENDPOINT_URL, node_details, format='json')
        self.assertEqual(response.status_code, 201)
        return response.data
