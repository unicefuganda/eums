from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.models import Programme, Item, ItemUnit, Consignee, DistributionPlanLineItem
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
        self.create_distribution_plan(plan_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def test_should_add_line_items_to_distribution_plan(self):
        plan_id = self.create_distribution_plan()
        item = Item.objects.create(description="Item 1", unit=ItemUnit.objects.create(name='EA'))
        # TODO Add api endpoints for Consignee and LineItems
        consignee = Consignee.objects.create(name="Save the Children", contact_person_id='1234')
        line_item = DistributionPlanLineItem.objects.create(
            item=item, quantity=10,
            under_current_supply_plan=False,
            planned_distribution_date='2014-01-21', consignee=consignee,
            destination_location='GULU', remark="Dispatched"
        )

        patch_data = {'line_items': [line_item.id]}
        response = self.client.patch(
            "%s%d/" % (ENDPOINT_URL, plan_id), patch_data, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(patch_data, response.data)

    def create_distribution_plan(self, plan_details=None):
        if not plan_details:
            plan_details = {'programme': self.programme.id}
        response = self.client.post(ENDPOINT_URL, plan_details, format='json')
        return response.data['id']