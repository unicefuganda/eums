from unittest import TestCase
from mock import MagicMock
from eums.models import DistributionPlanNode, SalesOrderItem, PurchaseOrderItem, ReleaseOrderItem, \
    ReleaseOrder, PurchaseOrder, SalesOrder
from eums.services import flow_scheduler
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory

from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory, \
    DistributionPlanNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DistributionPlanNodeTest(TestCase):
    def setUp(self):
        self.node = DistributionPlanNodeFactory()

    def tearDown(self):
        DistributionPlanNode.objects.all().delete()
        ReleaseOrderItem.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        SalesOrder.objects.all().delete()

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

    def test_should_schedule_run_when_node_saved_and_is_tracked_and_has_parent(self):
        flow_scheduler.schedule_run_for = MagicMock(return_value=None)
        from eums.signals import handlers

        node = NodeFactory(track=True, parent=NodeFactory())

        flow_scheduler.schedule_run_for.assert_called_with(node)
