from unittest import TestCase

from eums.models import DistributionPlanLineItem


class DistributionPlanItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        item = DistributionPlanLineItem()
        fields_in_item = [field.attname for field in item._meta.fields]

        expected_fields = [
            'item_id', 'quantity', 'under_current_supply_plan', 'planned_distribution_date',
            'consignee_id', 'destination_location', 'remark'
        ]

        for field in expected_fields:
            self.assertIn(field, fields_in_item)