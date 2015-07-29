from unittest import TestCase
from django.db import IntegrityError

from eums.models import DistributionPlanNode as DeliveryNode, SalesOrder, DistributionPlan, Arc
from eums.test.factories.arc_factory import ArcFactory
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

    def test_should_compute_quantity_in_from_incoming_arcs(self):
        node = DeliveryNodeFactory()
        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 50)

        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 100)

        Arc.objects.all().delete()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_compute_quantity_out_from_outgoing_arcs(self):
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=50)
        self.assertEqual(node_one.quantity_out(), 50)
        self.assertEqual(node_two.quantity_out(), 0)

        Arc.objects.all().delete()
        self.assertEqual(node_one.quantity_out(), 0)

    def test_should_compute_balance_from_incoming_and_outgoing_arcs(self):
        node_one = DeliveryNodeFactory()
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

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
