from unittest import TestCase

from eums.models import ItemUnit


class ItemUnitTest(TestCase):
    def test_should_have_all_expected_fields(self):
        item_unit = ItemUnit()
        fields_in_item = [field.attname for field in item_unit._meta.fields]

        for field in ['name']:
            self.assertIn(field, fields_in_item)
