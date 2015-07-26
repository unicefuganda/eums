from eums.models import Consignee, DistributionPlan
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.api.api_test_helpers import create_consignee, create_distribution_plan_node, \
    create_sales_order_item
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as DeliveryNodeFactory

ENDPOINT_URL = BACKEND_URL + 'consignee/'


class ConsigneeEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(ConsigneeEndpointTest, self).setUp()
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def test_should_get_consignees_sorted_by_name(self):
        consignee_one_details = {'name': "Save the Children", 'type': "implementing_partner",
                                 'customer_id': 'L100', 'imported_from_vision': True}
        consignee_two_details = {'name': "Feed the Children", 'type': "implementing_partner",
                                 'customer_id': '', 'imported_from_vision': False}

        create_consignee(self, consignee_one_details)
        create_consignee(self, consignee_two_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(consignee_two_details, response.data[0])
        self.assertDictContainsSubset(consignee_one_details, response.data[1])

    def test_should_get_consignee_deliveries(self):
        consignee = ConsigneeFactory()
        detail_route = '%s%d/deliveries/' % (ENDPOINT_URL, consignee.id)
        self.assertListEqual(self.client.get(detail_route).data, [])

        node_one = DeliveryNodeFactory(consignee=consignee)
        node_two = DeliveryNodeFactory(consignee=consignee)

        consignee_node_ids = self.client.get(detail_route).data

        self.assertEqual(len(consignee_node_ids), 2)
        self.assertIn(node_one.id, consignee_node_ids)
        self.assertIn(node_two.id, consignee_node_ids)

    def test_should_search_consignee_by_customer_id(self):
        consignee = ConsigneeFactory(customer_id='LX350')
        ConsigneeFactory(customer_id='AA')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'LX3'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_search_consignee_by_name(self):
        consignee = ConsigneeFactory(name='Save all of the children')
        ConsigneeFactory(name='consignee')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'all of the'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_search_consignee_by_location(self):
        consignee = ConsigneeFactory(location='Some Village')
        ConsigneeFactory(location='Luwafu')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'village'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_allow_post_of_consignee_with_only_name(self):
        consignee_one_details = {'name': "Other Children NGO"}
        response = self.client.post(ENDPOINT_URL, data=consignee_one_details)
        self.assertEqual(response.status_code, 201)

    def test_should_filter_consignees_by_imported_from_vision_flag(self):
        vision_consignee = ConsigneeFactory(imported_from_vision=True)
        ConsigneeFactory(imported_from_vision=False)

        response = self.client.get(ENDPOINT_URL + '?imported_from_vision=True')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], vision_consignee.id)

    def test_should_search_for_consignee_at_top_level(self):
        partner = ConsigneeFactory(name='Save the Children', type='implementing_partner')
        consignee = ConsigneeFactory(name='Kibuli DHO', type='middle_man')
        plan_id = DistributionPlanFactory(consignee=consignee).id
        item = create_sales_order_item(self)
        node_details = {'item': item['id'], 'targeted_quantity': 1, 'distribution_plan': plan_id,
                        'delivery_date': '2015-04-23', 'consignee': partner.id,
                        'tree_position': 'END_USER',
                        'location': 'Kampala', 'contact_person_id': u'1234', }

        create_distribution_plan_node(self, node_details)

        get_response = self.client.get(ENDPOINT_URL + '?node=top')

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset({'id': partner.id, 'name': partner.name}, get_response.data[0])
        self.assertEqual(1, len(get_response.data))

        get_response = self.client.get(ENDPOINT_URL + '?node=1')
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(2, len(get_response.data))

    def test_should_not_cache_consignees(self):
        first_consignee = create_consignee({'name': "Save the Children", 'type': 'implementing_partner'})
        create_consignee({'name': "Masaka DHO", 'type': 'middle_man'})
        create_consignee({'name': "Gulu DHO", 'type': 'middle_man'})

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        Consignee.objects.get(id=first_consignee['id']).delete()

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_should_paginate_consignee_list_on_request(self):
        ConsigneeFactory()
        ConsigneeFactory()
        response = self.client.get('%s?paginate=true' % ENDPOINT_URL)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_not_paginate_consignee_list_when_paginate_is_not_true(self):
        response = self.client.get('%s?paginate=falsy' % ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('results', response.data)
        self.assertEqual(response.data, [])
