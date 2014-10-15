from unittest import TestCase

from eums.models import DistributionPlanNode


class DistributionPlanNodeTest(TestCase):
    def setUp(self):
        self.node = DistributionPlanNode()

    def test_should_have_all_expected_fields(self):
        fields = self.node._meta._name_map

        self.assertEqual(len(self.node._meta.fields), 7)
        for field in ['parent', 'distribution_plan', 'consignee', 'tree_position', 'location', 'mode_of_delivery']:
            self.assertIn(field, fields)

    def test_no_two_nodes_should_have_the_same_consignee_and_distribution_plan(self):
        self.assertEqual(self.node._meta.unique_together, (('distribution_plan', 'consignee'),))
