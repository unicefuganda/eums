from django.contrib.auth.models import User
from mock import patch
from eums.models import Item, Consignee
from eums.test.api.api_test_helpers import create_item_unit, create_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.item_factory import ItemFactory

ENDPOINT_URL = BACKEND_URL + 'item/'


class ItemEndPointTest(AuthenticatedAPITestCase):
    @classmethod
    def tearDownClass(cls):
        Consignee.objects.all().delete()
        User.objects.all().delete()
        Item.objects.all().delete()

    def test_should_create_item(self):
        unit = create_item_unit(self)
        item_details = {'description': "Item 1", 'unit': unit['id'], 'material_code': "Item Code 1"}

        response = self.client.post(ENDPOINT_URL, item_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(item_details, response.data)

    def test_should_get_all_items_sorted_by_description_for_non_ip_user(self):
        unit = create_item_unit(self)
        item_one_details = {'description': "B Item", 'unit': unit['id'], 'material_code': "Item Code B"}
        item_two_details = {'description': "A Item", 'unit': unit['id'], 'material_code': "Item Code A"}

        create_item(self, item_one_details)
        create_item(self, item_two_details)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(item_two_details, get_response.data[0])
        self.assertDictContainsSubset(item_one_details, get_response.data[1])

    @patch('eums.models.Item.objects.delivered_to_consignee')
    def test_should_list_items_distributed_to_the_logged_in_users_ip_for_ip_user(self, mock_items_filter):
        consignee = ConsigneeFactory()
        item = ItemFactory()
        mock_items_filter.return_value = Item.objects.filter(pk=item.id)

        self.logout()
        self.log_consignee_in(consignee)
        response = self.client.get(ENDPOINT_URL)

        mock_items_filter.assert_called_with(consignee)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], item.id)

    def test_should_paginate_items_list_on_request(self):
        ItemFactory()
        ItemFactory()

        response = self.client.get('%s?paginate=true' % ENDPOINT_URL)

        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('pageSize', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_not_paginate_consignee_list_when_paginate_is_not_true(self):
        response = self.client.get('%s?paginate=falsy' % ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('results', response.data)
        self.assertEqual(response.data, [])
