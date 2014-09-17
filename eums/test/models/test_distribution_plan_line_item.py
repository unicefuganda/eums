from unittest import TestCase

from eums.models import DistributionPlanLineItem


class DistributionPlanLineItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        item = DistributionPlanLineItem()
        fields_in_item = item._meta._name_map

        expected_fields = [
            'item_id', 'quantity', 'under_current_supply_plan', 'planned_distribution_date',
            'consignee_id', 'destination_location', 'remark', 'distribution_plan_node'
        ]

        for field in expected_fields:
            self.assertIn(field, fields_in_item)