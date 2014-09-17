from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.models import Programme
from eums.test.api.test_distribution_plan_line_item_endpoint import create_distribution_plan_line_item
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(APITestCase):
    def setUp(self):
        self.programme = _create_programme()

    def test_should_create_distribution_plan_without_items(self):
        plan_details = {'programme': self.programme.id}
        create_distribution_plan(self, plan_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def xtest_should_add_line_items_to_distribution_plan(self):
        plan_id = create_distribution_plan(self)
        line_item = create_distribution_plan_line_item(self)

        patch_data = {'line_items': [line_item['id']]}
        response = self.client.patch(
            "%s%d/" % (ENDPOINT_URL, plan_id), patch_data, format='json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(patch_data, response.data)


def create_distribution_plan(test_case, plan_details=None):
    if not plan_details:
        programme = _create_programme()
        plan_details = {'programme': programme.id}
    response = test_case.client.post(ENDPOINT_URL, plan_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data['id']


def _create_programme():
    focal_person, _ = User.objects.get_or_create(
        username="Test", first_name="Test", last_name="User", email="me@you.com"
    )
    programme, _ = Programme.objects.get_or_create(focal_person=focal_person, name="Alive")
    return programme