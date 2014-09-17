from rest_framework.test import APITestCase
from eums.test.api.test_distribution_plan_endpoint import create_distribution_plan


class DistributionPlanNodeEndpoint(APITestCase):
    def test_should_create_distribution_plan_node_without_parent(self):
        plan_id = create_distribution_plan(self)
        node_details = {'distribution_plan_id': plan_id}
        pass
