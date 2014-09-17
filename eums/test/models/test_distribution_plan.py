from unittest import TestCase

from eums.models import DistributionPlan


class DistributionPlanTest(TestCase):
    def test_should_have_all_expected_fields(self):
        plan = DistributionPlan()
        fields_in_plan = [str(expected_field.attname) for expected_field in
                          (plan._meta.fields + plan._meta.many_to_many)]

        for expected_field in ['programme_id']:
            self.assertIn(expected_field, fields_in_plan)