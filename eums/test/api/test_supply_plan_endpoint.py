from rest_framework.test import APITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'supply-plan/'


class SupplyPlanEndpointTest(APITestCase):
    def test_should_create_supply_plan(self):
        data = {'program_name': 'SAFE'}

        response = self.client.post(ENDPOINT_URL, data, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(data, response.data)

    def test_should_get_all_supply_plans(self):
        plan_details = {'program_name': 'SAFE'}
        self.add_supply_plan(plan_params=plan_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def add_supply_plan(self, plan_params=None):
        if not plan_params:
            plan_params = {'program_name': 'SAFE'}
        response = self.client.post(ENDPOINT_URL, plan_params, format='json')
        return response