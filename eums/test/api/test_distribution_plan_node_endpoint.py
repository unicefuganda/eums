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
        child_node_details = {'distribution_plan': parent_node['distribution_plan'], 'parent': parent_node['id']}

        created_child_node_details = self.create_distribution_plan_node(child_node_details)

        self.assertDictContainsSubset(child_node_details, created_child_node_details)

    def test_should_get_distribution_plan_node_pointing_to_parent(self):
        created_parent, created_child = self.create_distribution_plan_parent_and_child_nodes()

        returned_child = self.client.get("%s%d/" % (ENDPOINT_URL, created_child['id'])).data

        expected_child = {'parent': created_parent['id'], 'distribution_plan': created_parent['distribution_plan']}

        self.assertDictContainsSubset(expected_child, returned_child)

    def test_should_get_distribution_plan_node_with_reference_to_children(self):
        created_parent, created_child = self.create_distribution_plan_parent_and_child_nodes()

        returned_parent = self.client.get("%s%d/" % (ENDPOINT_URL, created_parent['id'])).data

        expected_parent = {
            'parent': None,
            'distribution_plan': created_parent['distribution_plan'],
            'children': [created_child['id']]
        }

        self.assertDictContainsSubset(expected_parent, returned_parent)

    def create_distribution_plan_parent_and_child_nodes(self, parent_details=None, child_details=None):
        created_parent_details = self.create_distribution_plan_node(parent_details)
        if not child_details:
            child_details = {'distribution_plan': created_parent_details['distribution_plan'],
                             'parent': created_parent_details['id']}
        created_child_details = self.create_distribution_plan_node(child_details)
        return created_parent_details, created_child_details

    def create_distribution_plan_node(self, node_details=None):
        plan_id = create_distribution_plan(self)
        if not node_details:
            node_details = {'distribution_plan': plan_id}

        response = self.client.post(ENDPOINT_URL, node_details, format='json')
        self.assertEqual(response.status_code, 201)
        return response.data
