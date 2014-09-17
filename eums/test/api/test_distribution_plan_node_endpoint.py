from rest_framework.test import APITestCase

from eums.test.api.test_distribution_plan_endpoint import create_distribution_plan
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DistributionPlanNodeEndpoint(APITestCase):
    def test_should_create_distribution_plan_node_without_parent_node(self):
        plan_id = create_distribution_plan(self)
        node_details = {'distribution_plan': plan_id}

        response = self.client.post(ENDPOINT_URL, node_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(node_details, response.data)

    def test_should_create_distribution_plan_node_with_parent_node(self):
        pass
