from unittest import TestCase

from eums.models import Item


class ItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        item = Item()
        fields_in_item = [field.attname for field in item._meta.fields]

        for field in ['description', 'unit_id', 'material_code']:
            self.assertIn(field, fields_in_item)