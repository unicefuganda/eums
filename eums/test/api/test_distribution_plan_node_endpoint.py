from rest_framework.test import APITestCase
from eums.test.api.api_test_helpers import create_distribution_plan_node, create_distribution_plan_line_item, \
    make_line_item_details

from eums.test.api.test_distribution_plan_endpoint import create_distribution_plan
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DistributionPlanNodeEndpoint(APITestCase):
    def test_should_create_distribution_plan_node_without_parent_node(self):
        plan_id = create_distribution_plan(self)
        node_details = {'distribution_plan': plan_id}

        created_node_data = create_distribution_plan_node(self, node_details)

        self.assertDictContainsSubset(node_details, created_node_data)

    def test_should_create_distribution_plan_node_with_parent_node(self):
        parent_node = create_distribution_plan_node(self)
        child_node_details = {'distribution_plan': parent_node['distribution_plan'], 'parent': parent_node['id']}

        created_child_node_details = create_distribution_plan_node(self, child_node_details)

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

    def test_should_provide_distribution_plan_nodes_with_their_line_items(self):
        node_id = create_distribution_plan_node(self)['id']
        line_item_details = make_line_item_details(self, node_id)
        created_line_item = create_distribution_plan_line_item(self, line_item_details)
        expected_node_partial = {'distributionplanlineitem_set': [created_line_item['id']]}

        response = self.client.get("%s%d/" % (ENDPOINT_URL, node_id))

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_node_partial, response.data)

    def create_distribution_plan_parent_and_child_nodes(self, parent_details=None, child_details=None):
        created_parent_details = create_distribution_plan_node(self, parent_details)
        if not child_details:
            child_details = {'distribution_plan': created_parent_details['distribution_plan'],
                             'parent': created_parent_details['id']}
        created_child_details = create_distribution_plan_node(self, child_details)
        return created_parent_details, created_child_details
