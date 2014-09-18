from rest_framework.test import APITestCase

from eums.models import Item, ItemUnit, Consignee
from eums.test.api.api_test_helpers import create_distribution_plan_node, create_distribution_plan_line_item
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-line-item/'


class DistributionPlanLineItemTest(APITestCase):
    def test_should_create_distribution_plan_line_item(self):
        item_unit = ItemUnit.objects.create(name='EA')
        item = Item.objects.create(description='Item 1', unit=item_unit)
        node = create_distribution_plan_node(self)
        item_details = {'item': item.id, 'quantity': 10,
                        'under_current_supply_plan': False, 'planned_distribution_date': '2014-01-21',
                        'destination_location': 'GULU',
                        'distribution_plan_node': node['id'], 'remark': "Dispatched"}

        returned_item = create_distribution_plan_line_item(self, item_details)

        self.assertDictContainsSubset(item_details, returned_item)