from unittest import TestCase

from eums.models import SalesOrder


class SalesOrderTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_sales_order = [field for field in SalesOrder._meta._name_map]

        self.assertEquals(len(SalesOrder._meta.fields), 5)

        for field in ['order_number', 'programme', 'date', 'description']:
            self.assertIn(field, fields_in_sales_order)