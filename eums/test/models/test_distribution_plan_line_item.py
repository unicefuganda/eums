from unittest import TestCase

from eums.models import DistributionPlanLineItem, NodeLineItemRun
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


class DistributionPlanLineItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        item = DistributionPlanLineItem()
        fields_in_item = item._meta._name_map

        expected_fields = [
            'item_id', 'quantity', 'under_current_supply_plan', 'planned_distribution_date',
            'destination_location', 'remark', 'distribution_plan_node'
        ]

        for field in expected_fields:
            self.assertIn(field, fields_in_item)

    def test_should_get_node_line_item_run_with_status_not_started(self):
        node_line_item = DistributionPlanLineItemFactory()
        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.not_started)
        self.assertEqual(node_line_item.current_node_line_item_run(), line_item_run)

    def test_should_get_node_line_item_run_with_status_in_progress(self):
        node_line_item = DistributionPlanLineItemFactory()
        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.in_progress)
        self.assertEqual(node_line_item.current_node_line_item_run(), line_item_run)

    def test_should_not_get_node_line_item_run_with_status_completed(self):
        node_line_item = DistributionPlanLineItemFactory()
        NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.completed)
        self.assertEqual(node_line_item.current_node_line_item_run(), None)

    def test_should_not_get_node_line_item_run_with_status_expired(self):
        node_line_item = DistributionPlanLineItemFactory()
        NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.expired)
        self.assertEqual(node_line_item.current_node_line_item_run(), None)

