from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from eums.models import Programme
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(APITestCase):
    def test_should_create_distribution_plan_without_items(self):
        focal_person, _ = User.objects.get_or_create(
            username="Test", first_name="Test", last_name="User", email="me@you.com"
        )
        programme, _ = Programme.objects.get_or_create(focal_person=focal_person, name="Alive")
        plan_details = {'programme': programme.id}
        self.client.post(ENDPOINT_URL, plan_details, format='json')

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])