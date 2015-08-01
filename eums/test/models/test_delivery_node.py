from unittest import TestCase
from django.db import IntegrityError

from eums.models import DistributionPlanNode as DeliveryNode, SalesOrder, DistributionPlan, Arc, PurchaseOrderItem
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.distribution_plan_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DeliveryNodeTest(TestCase):
    def setUp(self):
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def test_should_have_all_expected_fields(self):
        node = DeliveryNodeFactory()
        fields = node._meta._name_map

        self.assertEqual(len(node._meta.fields), 12)
        for field in ['distribution_plan', 'consignee', 'tree_position', 'location',
                      'contact_person_id', 'item_id', 'delivery_date', 'remark',
                      'id', 'track', 'runnable_ptr']:
            self.assertIn(field, fields)

    def test_should_create_itself_with_any_type_of_order_item(self):
        sales_order_item = SalesOrderItemFactory()
        purchase_order_item = PurchaseOrderItemFactory()
        release_order_item = ReleaseOrderItemFactory()

        node_with_so_item = DeliveryNodeFactory(item=sales_order_item)
        node_with_po_item = DeliveryNodeFactory(item=purchase_order_item)
        node_with_ro_item = DeliveryNodeFactory(item=release_order_item)

        self.assertEqual(DeliveryNode.objects.get(item=sales_order_item), node_with_so_item)
        self.assertEqual(DeliveryNode.objects.get(item=purchase_order_item), node_with_po_item)
        self.assertEqual(DeliveryNode.objects.get(item=release_order_item), node_with_ro_item)

    def test_should_create_itself_with_parent_as_list_of_parent_quantity_tuples(self):
        parent_one = DeliveryNodeFactory(quantity=100)
        parent_two = DeliveryNodeFactory(quantity=40)

        node = DeliveryNodeFactory(parents=[(parent_one, 50), (parent_two, 40)])

        self.assertEqual(node.quantity_in(), 90)
        self.assertEqual(parent_one.quantity_out(), 50)
        self.assertEqual(parent_two.quantity_out(), 40)

    def test_should_compute_quantity_in_from_incoming_arcs(self):
        node = DeliveryNodeFactory(quantity=0)
        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 50)

        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 100)

        Arc.objects.all().delete()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_compute_quantity_out_from_outgoing_arcs(self):
        node_one = DeliveryNodeFactory(quantity=50)
        node_two = DeliveryNodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=50)
        self.assertEqual(node_one.quantity_out(), 50)
        self.assertEqual(node_two.quantity_out(), 0)

        Arc.objects.all().delete()
        self.assertEqual(node_one.quantity_out(), 0)

    def test_should_compute_balance_from_incoming_and_outgoing_arcs(self):
        node_one = DeliveryNodeFactory(quantity=0)
        ArcFactory(source=None, target=node_one, quantity=50)
        node_two = DeliveryNodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=30)
        self.assertEqual(node_one.balance(), 20)

        ArcFactory(source=node_one, target=node_two, quantity=10)
        self.assertEqual(node_one.balance(), 10)

    def test_should_create_null_source_arc_for_node_if_parents_are_not_specified_but_quantity_is(self):
        root_node = DeliveryNodeFactory(quantity=70)
        arc = Arc.objects.filter(target=root_node).first()
        self.assertEqual(arc.quantity, 70)
        self.assertIsNone(arc.source)

    def test_should_allow_zero_quantity_nodes_to_be_saved(self):
        node = DeliveryNodeFactory(quantity=0)
        self.assertEqual(node.id, DeliveryNode.objects.get(pk=node.id).id)

    def test_should_not_create_node_when_parents_and_quantity_are_not_specified(self):
        create_node = lambda: DeliveryNodeFactory(quantity=None, parents=None)
        self.assertRaises(IntegrityError, create_node)

    def test_should_create_an_arc_for_each_parent_specified_when_creating_a_node(self):
        parent_one = DeliveryNodeFactory()
        parent_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': parent_one.id, 'quantity': 5}, {'id': parent_two.id, 'quantity': 8}])
        arc_quantities = [arc.quantity for arc in node.arcs_in.all()]
        arc_sources = [arc.source.id for arc in node.arcs_in.all()]

        self.assertEqual(node.arcs_in.count(), 2)
        self.assertIn(8, arc_quantities)
        self.assertIn(5, arc_quantities)
        self.assertIn(parent_one.id, arc_sources)
        self.assertIn(parent_two.id, arc_sources)

    def test_should_list_all_root_nodes_for_a_delivery(self):
        delivery = DeliveryFactory()
        root_node_one = DeliveryNodeFactory(distribution_plan=delivery)
        root_node_two = DeliveryNodeFactory(distribution_plan=delivery)
        child_node = DeliveryNodeFactory(distribution_plan=delivery, parents=[{'id': root_node_one.id, 'quantity': 5}])

        root_nodes = DeliveryNode.objects.root_nodes_for(delivery=delivery)
        self.assertEqual(root_nodes.count(), 2)

        root_node_ids = [node.id for node in root_nodes]
        self.assertIn(root_node_one.id, root_node_ids)
        self.assertIn(root_node_two.id, root_node_ids)
        self.assertNotIn(child_node.id, root_node_ids)

    def test_update_should_override_parents_when_parents_list_is_passed(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 8}, {'id': node_two.id, 'quantity': 10}])
        self.assertEqual(node.quantity_in(), 18)

        node.parents = [{'id': node_one.id, 'quantity': 7}]
        node.save()
        self.assertEqual(node.quantity_in(), 7)

        node.parents = []
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_update_should_leave_parents_intact_if_parents_are_not_specified(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 8}, {'id': node_two.id, 'quantity': 10}])

        node.location = 'Changed'
        node.save()
        self.assertEqual(node.quantity_in(), 18)
        self.assertEqual(node.location, 'Changed')

    def test_update_quantity_on_root_node_should_update_quantity(self):
        node = DeliveryNodeFactory(quantity=100)
        node.quantity = 50
        node.save()
        self.assertEqual(node.quantity_in(), 50)

    def test_update_quantity_to__zero_on_root_node(self):
        node = DeliveryNodeFactory(quantity=100)
        node.quantity = 0
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_ignore_updates_to_quantity_on_non_root_node(self):
        node_one = DeliveryNodeFactory()
        node = DeliveryNodeFactory(parents=[{'id': node_one.id, 'quantity': 7}])

        node.quantity = 50
        node.save()

        self.assertEqual(node.quantity_in(), 7)

    def test_should_ignore_quantity_on_update_if_parents_are_specified(self):
        node_one = DeliveryNodeFactory()

        node = DeliveryNodeFactory(quantity=0)

        node.parents = [{'id': node_one.id, 'quantity': 7}]
        node.quantity = 50
        node.save()
        self.assertEqual(node.quantity_in(), 7)

        node.parents = []
        node.save()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_get_a_nodes_ip_from_the_root_node_of_the_node_delivery(self):
        delivery = DeliveryFactory()

        root_node = DeliveryNodeFactory(distribution_plan=delivery)
        self.assertEqual(root_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

        intermediary_node = DeliveryNodeFactory(distribution_plan=delivery, parents=[(root_node, 5)])
        self.assertEqual(intermediary_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

        leaf_node = DeliveryNodeFactory(parents=[(intermediary_node, 3)], distribution_plan=delivery)
        self.assertEqual(leaf_node.get_ip(), {'id': root_node.id, 'location': root_node.location})

    def test_should_get_sender_name(self):
        sender_name = 'Save the children'
        root_node = DeliveryNodeFactory(consignee=ConsigneeFactory(name=sender_name))
        self.assertEqual(root_node.sender_name(), 'UNICEF')

        node = DeliveryNodeFactory(parents=[(root_node, 5)])
        self.assertEqual(node.sender_name(), sender_name)

    def test_should_return_list_of_children(self):
        parent_node = DeliveryNodeFactory(quantity=100)
        child_one = DeliveryNodeFactory(parents=[(parent_node, 30)])
        child_two = DeliveryNodeFactory(parents=[(parent_node, 20)])

        children = parent_node.children()
        self.assertEqual(children.count(), 2)
        self.assertIn(child_one, children)
        self.assertIn(child_two, children)

    def test_should_get_root_nodes_for_an_order_item_list(self):
        purchase_order_item_one = PurchaseOrderItemFactory()
        purchase_order_item_two = PurchaseOrderItemFactory()
        root_node_one = DeliveryNodeFactory(item=purchase_order_item_one)
        root_node_two = DeliveryNodeFactory(item=purchase_order_item_two)
        DeliveryNodeFactory(item=purchase_order_item_one, parents=[(root_node_one, 5)])

        item_list = PurchaseOrderItem.objects.filter(pk__in=[purchase_order_item_one.pk, purchase_order_item_two.pk])

        root_nodes = DeliveryNode.objects.root_nodes_for(order_items=item_list)

        self.assertEqual(root_nodes.count(), 2)
        self.assertIn(root_node_one, root_nodes)
        self.assertIn(root_node_two, root_nodes)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
