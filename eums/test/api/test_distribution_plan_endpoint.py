from rest_framework.test import APITestCase

from eums.test.api.api_test_helpers import create_programme, create_distribution_plan, create_distribution_plan_node
from eums.test.api.test_distribution_plan_line_item_endpoint import create_distribution_plan_line_item
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(APITestCase):
    def setUp(self):
        self.programme = create_programme()

    def test_should_create_distribution_plan(self):
        plan_details = {'programme': self.programme.id}
        create_distribution_plan(self, plan_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def test_should_provide_distribution_plan_with_all_its_nodes(self):
        plan_id = create_distribution_plan(self)
        node = create_distribution_plan_node(self, {'distribution_plan': plan_id})
        expected_plan_partial = {'distributionplannode_set': [node['id']]}

        response = self.client.get("%s%d/" % (ENDPOINT_URL, plan_id))

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_plan_partial, response.data)

    # TODO Shouldn't do this. Line items are now part of Distribution Plan Nodes
    def xtest_should_add_line_items_to_distribution_plan(self):
        plan_id = create_distribution_plan(self)
        line_item = create_distribution_plan_line_item(self)

        patch_data = {'line_items': [line_item['id']]}
        response = self.client.patch(
            "%s%d/" % (ENDPOINT_URL, plan_id), patch_data, format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(patch_data, response.data)