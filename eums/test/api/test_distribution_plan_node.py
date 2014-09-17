from rest_framework.test import APITestCase

from eums.models import Item, ItemUnit, Consignee
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DistributionPlanLineItemTest(APITestCase):
    def setUp(self):
        item_unit = ItemUnit.objects.create(name='EA')
        self.item = Item.objects.create(description='Item 1', unit=item_unit)
        # TODO Move to creation using consignee endpoint
        self.consignee = Consignee.objects.create(name="Save the Children", contact_person_id='1234')

    def test_should_create_distribution_plan_line_item(self):
        item_details = {'item': self.item.id, 'quantity': 10,
                        'under_current_supply_plan': False,
                        'planned_distribution_date': '2014-01-21', 'consignee': self.consignee.id,
                        'destination_location': 'GULU', 'remark': "Dispatched"}

        response = create_distribution_plan_line_item(self, item_details)
        self.assertDictContainsSubset(item_details, response)


def create_distribution_plan_line_item(test_ref, item_details=None):
    item_unit = ItemUnit.objects.create(name='EA')
    item = Item.objects.create(description='Item 1', unit=item_unit)
    consignee = Consignee.objects.create(name="Save the Children", contact_person_id='1234')

    if not item_details:
        item_details = {
            'item': item.id, 'quantity': 10, 'under_current_supply_plan': False,
            'planned_distribution_date': '2014-01-21', 'consignee': consignee.id,
            'destination_location': 'GULU', 'remark': "Dispatched"
        }
    response = test_ref.client.post(ENDPOINT_URL, item_details, format='json')

    test_ref.assertEqual(response.status_code, 201)

    formatted_data = response.data
    formatted_data['planned_distribution_date'] = str(formatted_data['planned_distribution_date'])

    return formatted_data
