import json
from eums.models import DistributionPlanNode as DeliveryNode, SalesOrder, DistributionPlan
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory

ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DeliveryNodeEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        self.clean_up()
        super(DeliveryNodeEndpointTest, self).setUp()
        self.MIDDLEMAN_POSITION = 'MIDDLE_MAN'
        self.END_USER_POSITION = 'END_USER'
        self.delivery = DeliveryFactory()
        self.consignee = ConsigneeFactory()
        self.item = PurchaseOrderItemFactory()
        self.node_details = {
            'distribution_plan': self.delivery.id,
            'location': 'Kampala',
            'consignee': self.consignee.id,
            'contact_person_id': '23FE8E64-A6B8-4BA5-A9E3-8535F355EA77',
            'item': self.item.id,
            'tree_position': self.END_USER_POSITION,
            'delivery_date': '2015-02-02'
        }

    def tearDown(self):
        self.clean_up()

    def clean_up(self):
        SalesOrder.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def test_should_filter_nodes_by_delivery(self):
        create_delivery = lambda node_id: DeliveryFactory(id=node_id)
        first_delivery = create_delivery(1)
        second_delivery = create_delivery(2)

        create_delivery_node = lambda delivery: DeliveryNodeFactory(distribution_plan=delivery)
        node_one = create_delivery_node(first_delivery)
        node_two = create_delivery_node(first_delivery)
        create_delivery_node(second_delivery)

        returned_nodes = self.client.get('%s?distribution_plan=%d' % (ENDPOINT_URL, first_delivery.id)).data
        self.assertEqual(len(returned_nodes), 2)
        self.assertIn(node_one.id, [node['id'] for node in returned_nodes])
        self.assertIn(node_two.id, [node['id'] for node in returned_nodes])

    def test_should_filter_distribution_plan_nodes_by_contact_person_id(self):
        contact_person_id = '8541BD02-E862-48FD-952D-470445347DAE'
        DeliveryNodeFactory()
        node = DeliveryNodeFactory(contact_person_id=contact_person_id)
        self.assertEqual(DeliveryNode.objects.count(), 2)
        response = self.client.get('%s?contact_person_id=%s' % (ENDPOINT_URL, contact_person_id))
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], node.id)

    def test_should_create_delivery_node_without_parents_with_quantity(self):
        self.node_details['quantity'] = 100

        response = self.client.post(ENDPOINT_URL, data=self.node_details)
        node = DeliveryNode.objects.get(pk=response.data['id'])

        self.assertEqual(response.status_code, 201)
        self.assertTrue(node.quantity_in(), 100)

    def test_should_create_delivery_node_with_parents(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()
        self.node_details['parents'] = [{'id': node_one.id, 'quantity': 5}, {'id': node_two.id, 'quantity': 6}]

        response = self.client.post(ENDPOINT_URL, data=json.dumps(self.node_details), content_type='application/json')
        node = DeliveryNode.objects.get(pk=response.data['id'])

        self.assertEqual(response.status_code, 201)
        self.assertTrue(node.quantity_in(), 11)
        self.assertTrue(node_one.quantity_out(), 5)
        self.assertTrue(node_two.quantity_out(), 6)

    def test_should_update_delivery_node_parents(self):
        node_one = DeliveryNodeFactory()
        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 5}])

        changes = {'parents': [{'id': node_one.id, 'quantity': 8}]}
        path = '%s%d/' % (ENDPOINT_URL, node.id)
        response = self.client.patch(path, data=json.dumps(changes), content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(node.quantity_in(), 8)

    def test_should_paginate_items_list_on_request(self):
        DeliveryNodeFactory()
        DeliveryNodeFactory()
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

    def test_should_return_deliveries_made_by_logged_in_consignee_for_a_specific_item(self):
        self.logout()
        self.log_consignee_in(self.consignee)
        item = ItemFactory()
        parent_node_one = DeliveryNodeFactory(consignee=self.consignee)
        parent_node_two = DeliveryNodeFactory(consignee=self.consignee)
        non_consignee_node = DeliveryNodeFactory()

        child_one = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), parents=[(parent_node_one, 10)])
        child_two = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), parents=[(parent_node_two, 5)])
        child_three = DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item), parents=[(non_consignee_node, 2)])

        url_template = '%s?consignee_deliveries_for_item=%d&paginate=true'
        response = self.client.get(url_template % (ENDPOINT_URL, item.id))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['pageSize'], 10)
        node_ids = map(lambda node_dict: node_dict['id'], response.data['results'])
        self.assertItemsEqual([child_one.id, child_two.id], node_ids)
        self.assertNotIn(child_three.id, node_ids)

    def test_should_return_deliveries_made_to_the_logged_in_consignee_if_consignee_item_filter_is_not_applied(self):
        self.logout()
        self.log_consignee_in(self.consignee)
        consignee_node = DeliveryNodeFactory(consignee=self.consignee)
        non_consignee_node = DeliveryNodeFactory()
        response = self.client.get(ENDPOINT_URL)

        node_ids = [node['id'] for node in response.data]
        self.assertEqual(DeliveryNode.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee_node.id, node_ids)
        self.assertNotIn(non_consignee_node.id, node_ids)
