from unittest import TestCase

from eums.models import DistributionPlan


class DistributionPlanTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_plan = DistributionPlan()._meta._name_map

        for expected_field in ['programme_id']:
            self.assertIn(expected_field, fields_in_plan)