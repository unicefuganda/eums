from unittest import TestCase

from eums.models import DistributionPlanNode


class DistributionPlanNodeTest(TestCase):

    def test_should_have_all_expected_fields(self):
        node = DistributionPlanNode()
        fields = node._meta._name_map

        for field in ['parent', 'distribution_plan', 'consignee', 'scheduled_message_task_id']:
            self.assertIn(field, fields)

    def test_no_two_nodes_should_have_the_same_consignee_and_distribution_plan(self):
        node = DistributionPlanNode()
        self.assertEqual(node._meta.unique_together, (('distribution_plan', 'consignee'),))