from django.contrib.auth.models import User

from eums.models import Item, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.consignee_item_factory import ConsigneeItemFactory
from eums.test.factories.item_factory import ItemFactory

ENDPOINT_URL = BACKEND_URL + 'consignee-item/'


class ConsigneeItemEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        self.logout()
        self.consignee = ConsigneeFactory()
        self.log_consignee_in(self.consignee)

    @classmethod
    def tearDownClass(cls):
        Consignee.objects.all().delete()
        User.objects.all().delete()
        Item.objects.all().delete()

    def test_should_paginate_items_list(self):
        ConsigneeItemFactory(consignee=self.consignee)
        ConsigneeItemFactory(consignee=self.consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('pageSize', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_search_item_by_description(self):
        consignee_item = ConsigneeItemFactory(consignee=self.consignee, item=ItemFactory(description='Plumpynut'))
        ConsigneeItemFactory(item=ItemFactory(description='AA'))
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'Plum'))
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertIn(consignee_item.id, [consignee_item['id'] for consignee_item in results])

    def test_should_filter_by_item_id(self):
        item = ItemFactory()
        consignee_item = ConsigneeItemFactory(item=item, consignee=self.consignee)
        ConsigneeItemFactory(consignee=self.consignee)

        response = self.client.get('%s?item=%d' % (ENDPOINT_URL, item.id))

        consignee_items = response.data['results']
        consignee_item_ids = [item['id'] for item in consignee_items]
        self.assertEqual(len(consignee_items), 1)
        self.assertIn(consignee_item.id, consignee_item_ids)
