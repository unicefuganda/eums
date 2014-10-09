from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from eums.models import Item, ItemUnit
from eums.test.api.api_test_helpers import create_distribution_plan_node, create_distribution_plan_line_item, \
    create_sales_order, create_sales_order_item, create_consignee
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-line-item/'


class DistributionPlanLineItemTest(APITestCase):
    def test_should_create_distribution_plan_line_item(self):
        item_unit = ItemUnit.objects.create(name='EA')
        item = Item.objects.create(description='Item 1', unit=item_unit)
        sales_order = create_sales_order(self)

        sales_order_details = {'sales_order': sales_order['id'], 'item': item.id, 'quantity': 23,
                               'net_price': 12000.0, 'net_value': 100.0, 'issue_date': '2014-01-21',
                               'delivery_date': '2014-01-21'}

        sales_item_id = create_sales_order_item(self, sales_order_details)['id']

        focal_person, _ = User.objects.get_or_create(
            username="Test", first_name="Test", last_name="User", email="me@you.com"
        )

        consignee_id = create_consignee(self)['id']
        node = create_distribution_plan_node(self)

        item_details = {'item': sales_item_id, 'targeted_quantity': 10, 'planned_distribution_date': '2014-01-21',
                        'destination_location': 'GULU', 'programme_focal': focal_person.id, 'consignee': consignee_id,
                        'contact_person': 'Test', 'contact_phone_number': '0110110111', 'mode_of_delivery': 'Road',
                        'tracked': True, 'remark': "Dispatched", 'distribution_plan_node': node['id']}

        returned_item = create_distribution_plan_line_item(self, item_details)

        self.assertDictContainsSubset(item_details, returned_item)