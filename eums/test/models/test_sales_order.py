from unittest import TestCase

from eums.models import SalesOrder


class SalesOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = SalesOrder._meta._name_map

        for field in ['order_number']:
            self.assertIn(field, fields_in_item)