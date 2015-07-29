from unittest import TestCase

from eums.models import DistributionPlanNode, SalesOrder, DistributionPlan, Arc
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory, \
    DistributionPlanNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DistributionPlanNodeTest(TestCase):
    def setUp(self):
        self.node = DistributionPlanNodeFactory()

    def tearDown(self):
        self.clean_up()

    def test_should_have_all_expected_fields(self):
        fields = self.node._meta._name_map

        self.assertEqual(len(self.node._meta.fields), 14)
        for field in ['parent', 'distribution_plan', 'consignee', 'tree_position', 'location',
                      'contact_person_id', 'item_id', 'targeted_quantity', 'delivery_date', 'remark',
                      'id', 'track', 'runnable_ptr']:
            self.assertIn(field, fields)

    def test_should_create_itself_with_any_type_of_order_item(self):
        sales_order_item = SalesOrderItemFactory()
        purchase_order_item = PurchaseOrderItemFactory()
        release_order_item = ReleaseOrderItemFactory()

        node_with_so_item = NodeFactory(item=sales_order_item)
        node_with_po_item = NodeFactory(item=purchase_order_item)
        node_with_ro_item = NodeFactory(item=release_order_item)

        self.assertEqual(DistributionPlanNode.objects.get(item=sales_order_item), node_with_so_item)
        self.assertEqual(DistributionPlanNode.objects.get(item=purchase_order_item), node_with_po_item)
        self.assertEqual(DistributionPlanNode.objects.get(item=release_order_item), node_with_ro_item)

    def test_should_compute_quantity_in_from_incoming_arcs(self):
        node = NodeFactory()
        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 50)

        ArcFactory(source=None, target=node, quantity=50)
        self.assertEqual(node.quantity_in(), 100)

        Arc.objects.all().delete()
        self.assertEqual(node.quantity_in(), 0)

    def test_should_compute_quantity_out_from_outgoing_arcs(self):
        node_one = NodeFactory()
        node_two = NodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=50)
        self.assertEqual(node_one.quantity_out(), 50)
        self.assertEqual(node_two.quantity_out(), 0)

        Arc.objects.all().delete()
        self.assertEqual(node_one.quantity_out(), 0)

    def test_should_compute_balance_from_incoming_and_outgoing_arcs(self):
        node_one = NodeFactory()
        ArcFactory(source=None, target=node_one, quantity=50)
        node_two = NodeFactory()
        ArcFactory(source=node_one, target=node_two, quantity=30)
        self.assertEqual(node_one.balance(), 20)

        ArcFactory(source=node_one, target=node_two, quantity=10)
        self.assertEqual(node_one.balance(), 10)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
