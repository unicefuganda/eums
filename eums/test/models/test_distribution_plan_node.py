from unittest import TestCase
from eums.models import DistributionPlanNode


class DistributionPlanNodeTest(TestCase):

    def test_should_have_all_expected_fields(self):
        node = DistributionPlanNode()
        fields = node._meta._name_map

        for field in ['parent', 'distribution_plan', 'consignee']:
            self.assertIn(field, fields)