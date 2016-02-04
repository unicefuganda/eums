import json
import logging
from datetime import datetime

from django.contrib.auth.models import User, Group
from rest_framework.status import HTTP_200_OK

from eums.api.distribution_plan_node.distribution_plan_node_endpoint import DistributionPlanNodeViewSet
from eums.models import DistributionPlanNode as DeliveryNode, SalesOrder, DistributionPlan, DeliveryNodeLoss, \
    DistributionPlanNode, UserProfile
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'

logger = logging.getLogger(__name__)


class DeliveryNodeEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
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
            'delivery_date': '2015-02-02',
        }

    def clean_up(self):
        SalesOrder.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def test_should_filter_nodes_by_order_item_item(self):
        self.assertIn('item__item', DistributionPlanNodeViewSet.filter_fields)

    def test_should_add_consignee_name_accessor_to_delivery_nodes_fetched_from_endpoint(self):
        consignee_name = 'WAKISO DHO'
        consignee = ConsigneeFactory(name=consignee_name)
        DeliveryNodeFactory(consignee=consignee)
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.data[0]['consignee_name'], consignee_name)

    def test_should_add_item_description_accessor_to_delivery_nodes_fetched_from_endpoint(self):
        item_description = 'PlumpyNut'
        item = ItemFactory(description=item_description)
        DeliveryNodeFactory(item=PurchaseOrderItemFactory(item=item))
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.data[0]['item_description'], item_description)

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
        node = DeliveryNodeFactory(contact_person_id=contact_person_id, additional_remarks='It is very good')
        self.assertEqual(DeliveryNode.objects.count(), 2)
        response = self.client.get('%s?contact_person_id=%s' % (ENDPOINT_URL, contact_person_id))
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], node.id)
        self.assertEqual(response.data[0]['additional_remarks'], node.additional_remarks)

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

    def test_should_filter_nodes_by_location(self):
        kagoma_one = DeliveryNodeFactory(location='Kagoma')
        DeliveryNodeFactory(location='Kabaale')
        kagoma_two = DeliveryNodeFactory(location='Kagoma')

        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'Kag'))

        nodes = response.data
        node_ids = [node['id'] for node in nodes]
        self.assertEqual(len(nodes), 2)
        self.assertItemsEqual([kagoma_one.id, kagoma_two.id], node_ids)

    def test_should_filter_nodes_by_consignee_name(self):
        consignee = ConsigneeFactory(name='Kapere')
        delivery_node = DeliveryNodeFactory(consignee=consignee)
        DeliveryNodeFactory()
        DeliveryNodeFactory()

        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'Kape'))

        nodes = response.data
        node_ids = [node['id'] for node in nodes]

        self.assertEqual(len(nodes), 1)
        self.assertItemsEqual([delivery_node.id], node_ids)

    def test_should_search_nodes_by_date(self):
        delivery_node = DeliveryNodeFactory(delivery_date=datetime(2014, 04, 14))
        DeliveryNodeFactory(delivery_date=datetime(2015, 04, 23))

        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, '2014-04'))

        nodes = response.data
        node_ids = [node['id'] for node in nodes]

        self.assertEqual(len(nodes), 1)
        self.assertItemsEqual([delivery_node.id], node_ids)

    def test_should_include_order_number_in_delivery_node_fields(self):
        purchase_order = PurchaseOrderFactory(order_number=200)
        DeliveryNodeFactory(item=PurchaseOrderItemFactory(purchase_order=purchase_order))

        release_order = ReleaseOrderFactory(waybill=300)
        DeliveryNodeFactory(item=ReleaseOrderItemFactory(release_order=release_order))

        response = self.client.get(ENDPOINT_URL)
        node_order_numbers = [node['order_number'] for node in response.data]
        self.assertItemsEqual([300, 200], node_order_numbers)

    def test_should_filter_out_distributable_nodes(self):
        distributable_parent = DeliveryNodeFactory(quantity=100, consignee=self.consignee,
                                                   tree_position=DeliveryNode.IMPLEMENTING_PARTNER)
        delivery = DeliveryFactory(confirmed=True)
        distributable_confirmed_parent = DeliveryNodeFactory(quantity=50, consignee=self.consignee,
                                                             distribution_plan=delivery,
                                                             acknowledged=50,
                                                             tree_position=DeliveryNode.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(parents=[(distributable_parent, 50)])
        DeliveryNodeFactory(parents=[(distributable_confirmed_parent, 30)])
        closed_parent = DeliveryNodeFactory(quantity=80, consignee=self.consignee,
                                            tree_position=DeliveryNode.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(parents=[(closed_parent, 80)])

        self.logout()
        self.log_consignee_in(self.consignee)
        response = self.client.get('%s?is_distributable=true' % ENDPOINT_URL)

        node_ids = [node['id'] for node in response.data]
        logger.info(response.data)
        self.assertEqual(len(response.data), 1)
        self.assertIn(distributable_confirmed_parent.id, node_ids)
        self.assertNotIn(distributable_parent.id, node_ids)
        self.assertNotIn(closed_parent.id, node_ids)

    def test_should_return_child_nodes_for_a_parent_node_and_of_an_item(self):
        self.logout()
        self.log_consignee_in(self.consignee)
        item = ItemFactory()
        po_item = PurchaseOrderItemFactory(item=item)
        parent = DeliveryNodeFactory(quantity=100, consignee=self.consignee, item=po_item)
        child_one = DeliveryNodeFactory(parents=[(parent, 30)], item=po_item)
        child_two = DeliveryNodeFactory(parents=[(parent, 30)], item=po_item)
        DeliveryNodeFactory(item=po_item)

        response = self.client.get('%s?item__item=%d&parent=%d' % (ENDPOINT_URL, item.id, parent.id))

        node_ids = [node['id'] for node in response.data]
        self.assertItemsEqual([child_one.id, child_two.id], node_ids)

    def test_should_include_downstream_delivery_nodes_whose_ip_is_the_logged_in_consignees_ip(self):
        self.logout()
        self.log_consignee_in(self.consignee)
        root = DeliveryNodeFactory(consignee=self.consignee, quantity=100)
        child = DeliveryNodeFactory(parents=[(root, 10)])
        grandchild = DeliveryNodeFactory(parents=[(child, 5)])

        response = self.client.get(ENDPOINT_URL)

        node_ids = [node['id'] for node in response.data]

        self.assertEqual(len(node_ids), 3)
        self.assertItemsEqual(node_ids, [root.id, child.id, grandchild.id])

    def test_should_exclude_downstream_delivery_nodes_when_unicef_users_is_logged_in(self):
        root = DeliveryNodeFactory(consignee=self.consignee, quantity=100)
        child = DeliveryNodeFactory(parents=[(root, 10)])
        grandchild = DeliveryNodeFactory(parents=[(child, 5)])

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'is_root=True'))
        node_ids = [node['id'] for node in response.data]

        self.assertEqual(len(node_ids), 1)
        self.assertItemsEqual(node_ids, [root.id])
        self.assertNotIn(grandchild.id, node_ids)
        self.assertNotIn(child.id, node_ids)

    def test_should_get_lineage_for_node(self):
        root = DeliveryNodeFactory(consignee=self.consignee, quantity=100)
        child = DeliveryNodeFactory(parents=[(root, 10)])
        grand_child = DeliveryNodeFactory(parents=[(child, 5)])
        great_grand_child = DeliveryNodeFactory(parents=[(grand_child, 5)])

        response = self.client.get(ENDPOINT_URL + str(great_grand_child.id) + '/lineage/')
        node_ids = [node['id'] for node in response.data]

        self.assertEqual(len(node_ids), 2)
        self.assertItemsEqual(node_ids, [child.id, grand_child.id])
        self.assertNotIn(root.id, node_ids)
        self.assertNotIn(great_grand_child.id, node_ids)

    def test_should_report_loss_on_node(self):
        self.log_ip_editor_in()

        self.assertEqual(DeliveryNodeLoss.objects.count(), 0)
        node_one = DeliveryNodeFactory(acknowledged=100, tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        loss = {'quantity': 15}

        response = self.client.patch(ENDPOINT_URL + str(node_one.id) + '/report_loss/', data=json.dumps(loss), content_type='application/json')

        node = DeliveryNodeLoss.objects.first().delivery_node

        self.assertEqual(response.status_code, 204)
        self.assertEqual(DeliveryNodeLoss.objects.count(), 1)
        self.assertEqual(node.balance, 85)

    def test_returned_nodes_should_have_order_type_field(self):
        po_node = DeliveryNodeFactory(item=PurchaseOrderItemFactory(purchase_order=(PurchaseOrderFactory())))
        ro_node = DeliveryNodeFactory(item=ReleaseOrderItemFactory(release_order=(ReleaseOrderFactory())))

        response = self.client.get(ENDPOINT_URL)
        node_order_types = [node['order_type'] for node in response.data]

        self.assertItemsEqual([po_node.type(), ro_node.type()], node_order_types)

    def test_unicef_admin_should_have_permission_to_view_delivery_nodes(self):
        self.log_and_assert_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_have_permission_to_view_delivery_nodes(self):
        self.log_and_assert_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_have_permission_to_view_delivery_nodes(self):
        self.log_and_assert_permission(self.log_unicef_viewer_in, HTTP_200_OK)

    def test_ip_editor_should_have_permission_to_view_delivery_nodes(self):
        self.log_and_assert_permission(self.log_ip_editor_in, HTTP_200_OK)

    def test_ip_viewer_should_have_permission_to_view_delivery_nodes(self):
        self.log_and_assert_permission(self.log_ip_viewer_in, HTTP_200_OK)

    def log_and_assert_permission(self, log_func, status_code):
        self.logout()
        log_func()
        self.assertEqual(self.client.get(ENDPOINT_URL).status_code, status_code)
