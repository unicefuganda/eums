from unittest import TestCase

from eums.models import DistributionPlanLineItem, NodeLineItemRun
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


class DistributionPlanLineItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        line_item = DistributionPlanLineItem()
        fields_in_item = line_item._meta._name_map

        self.assertEqual(len(line_item._meta.fields), 7)
        expected_fields = [
            'item_id', 'targeted_quantity', 'planned_distribution_date', 'remark', 'distribution_plan_node_id', 'id',
            'track']

        for field in expected_fields:
            self.assertIn(field, fields_in_item)

    def test_should_get_node_line_item_run_with_status_scheduled(self):
        node_line_item = DistributionPlanLineItemFactory()
        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.scheduled)
        self.assertEqual(node_line_item.current_run(), line_item_run)

    def test_should_not_get_node_line_item_run_with_status_completed(self):
        node_line_item = DistributionPlanLineItemFactory()
        NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.completed)
        self.assertEqual(node_line_item.current_run(), None)

    def test_should_not_get_node_line_item_run_with_status_expired(self):
        node_line_item = DistributionPlanLineItemFactory()
        NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.expired)
        self.assertEqual(node_line_item.current_run(), None)

    def test_should_not_get_node_line_item_run_with_status_cancelled(self):
        node_line_item = DistributionPlanLineItemFactory()
        NodeLineItemRunFactory(node_line_item=node_line_item, status=NodeLineItemRun.STATUS.cancelled)
        self.assertEqual(node_line_item.current_run(), None)

    def test_should_get_the_current_completed_line_item_run(self):
        node_line_item = DistributionPlanLineItemFactory()

        self.assertIsNone(node_line_item.completed_run())

        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, status='completed')

        self.assertEqual(node_line_item.completed_run(), line_item_run)