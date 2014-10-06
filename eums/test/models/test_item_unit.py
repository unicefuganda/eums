from unittest import TestCase

from eums.models import ItemUnit


class ItemUnitTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = ItemUnit()._meta._name_map

        for field in ['name']:
            self.assertIn(field, fields_in_item)