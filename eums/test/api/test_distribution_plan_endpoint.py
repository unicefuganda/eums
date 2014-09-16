from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.models import Programme
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(APITestCase):
    def setUp(self):
        focal_person, _ = User.objects.get_or_create(
            username="Test", first_name="Test", last_name="User", email="me@you.com"
        )
        self.programme, _ = Programme.objects.get_or_create(focal_person=focal_person, name="Alive")

    def test_should_create_distribution_plan_without_items(self):
        plan_details = {'programme': self.programme.id}
        self.client.post(ENDPOINT_URL, plan_details, format='json')

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def test_should_add_line_items_to_distribution_plan(self):
        pass

    def create_distribution_plan(self):
        pass