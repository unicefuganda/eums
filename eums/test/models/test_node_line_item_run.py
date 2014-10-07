from unittest import TestCase

from eums.models import NodeLineItemRun, DistributionPlanNode, DistributionPlanLineItem
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


class NodeLineItemRunTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        self.line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

    def test_should_have_all_expected_fields(self):
        node_line_item_run = NodeLineItemRun()
        fields_in_node_line_item_run = [field.attname for field in node_line_item_run._meta.fields]
        self.assertEqual(len(fields_in_node_line_item_run), 5)

        for field in ['scheduled_message_task_id', 'node_line_item_id', 'status', 'phone']:
            self.assertIn(field, fields_in_node_line_item_run)

    def test_should_get_current_run_for_consignee_with_run_with_status_not_started(self):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)

        self.assertEqual(NodeLineItemRun.current_run_for_consignee(self.consignee.id), line_item_run)

    def test_should_get_current_run_for_consignee_with_run_with_status_in_progress(self):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item, status=NodeLineItemRun.STATUS.in_progress)

        self.assertEqual(NodeLineItemRun.current_run_for_consignee(self.consignee.id), line_item_run)

    def test_should_get_none_when_current_run_is_called_for_a_consignee_with_no_runs_in_progress_or_not_started(self):
        NodeLineItemRunFactory(node_line_item=self.line_item, status=NodeLineItemRun.STATUS.expired)
        NodeLineItemRunFactory(node_line_item=self.line_item, status=NodeLineItemRun.STATUS.completed)

        self.assertEqual(NodeLineItemRun.current_run_for_consignee(self.consignee.id), None)