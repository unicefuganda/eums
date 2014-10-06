from unittest import TestCase

from eums.models import Item


class ItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = Item()._meta._name_map

        for field in ['description', 'unit_id', 'material_code']:
            self.assertIn(field, fields_in_item)