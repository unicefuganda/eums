from unittest import TestCase

from eums.models import DistributionPlan, SalesOrder
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class DistributionPlanTest(TestCase):
    def setUp(self):
        self.clean_up()
        self.po_item_one = PurchaseOrderItemFactory(value=200)
        self.po_item_two = PurchaseOrderItemFactory(value=100)

        self.delivery = DistributionPlanFactory()
        self.node_one = DistributionPlanNodeFactory(distribution_plan=self.delivery, item=self.po_item_one)
        DistributionPlanNodeFactory(distribution_plan=self.delivery, item=self.po_item_two)

    def tearDown(self):
        self.clean_up()

    def clean_up(self):
        SalesOrder.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_plan = DistributionPlan()._meta._name_map

        for expected_field in ['programme_id']:
            self.assertIn(expected_field, fields_in_plan)

    def test_should_compute_total_value_delivered_from_order_item_values(self):
        self.assertEqual(self.delivery.total_value(), 300)

    def test_should_ignore_child_nodes_value_when_computing_total_value(self):
        DistributionPlanNodeFactory(parent=self.node_one, item=self.po_item_one, distribution_plan=self.delivery)
        self.assertEqual(self.delivery.total_value(), 300)
