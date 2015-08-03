from unittest import TestCase

from eums.models import DistributionPlan, SalesOrder
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class DistributionPlanTest(TestCase):
    def setUp(self):
        self.po_item_one = PurchaseOrderItemFactory(value=400, quantity=200) #val = 2
        self.po_item_two = PurchaseOrderItemFactory(value=600, quantity=100) #val = 6

        self.delivery = DistributionPlanFactory()
        self.node_one = DistributionPlanNodeFactory(distribution_plan=self.delivery, item=self.po_item_one,
                                                    targeted_quantity=50)
        DistributionPlanNodeFactory(distribution_plan=self.delivery, item=self.po_item_two, targeted_quantity=30)

    def tearDown(self):
        SalesOrder.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_plan = DistributionPlan()._meta._name_map

        for expected_field in ['programme_id']:
            self.assertIn(expected_field, fields_in_plan)

    def test_should_compute_total_value_delivered_from_order_item_values(self):
        self.assertEqual(self.delivery.total_value(), 280)

    def test_should_ignore_child_nodes_value_when_computing_total_value(self):
        DistributionPlanNodeFactory(parent=self.node_one, item=self.po_item_one, distribution_plan=self.delivery)
        self.assertEqual(self.delivery.total_value(), 280)
