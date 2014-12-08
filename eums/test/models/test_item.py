from unittest import TestCase
from django.db import IntegrityError

from eums.models import Item
from eums.test.factories.item_factory import ItemFactory


class ItemTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = [field for field in Item._meta._name_map]

        self.assertEquals(len(Item._meta.fields), 4)

        for field in ['description', 'unit_id', 'material_code']:
            self.assertIn(field, fields_in_item)

    def test_no_two_items_should_have_the_same_material_code_and_description(self):
        create_item = lambda: ItemFactory(material_code='C234', description='description')
        create_item()
        self.assertRaises(IntegrityError, create_item)