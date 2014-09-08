from rest_framework.test import APITestCase


class SupplyPlanEndpointTest(APITestCase):

    def test_should_create_supply_plan(self):
        data = {'program_name': 'test_program'}
        response = self.client.post('/api/supply-plan/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {'id': 1, 'program_name': 'test_program'})