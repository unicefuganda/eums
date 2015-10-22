from unittest import TestCase

from django.db import IntegrityError

from eums.models import Item
from eums.test.factories.item_factory import ItemFactory


class ItemTest(TestCase):
    def tearDown(self):
        Item.objects.all().delete()

    def setUp(self):
        Item.objects.all().delete()

    def test_no_two_items_should_have_the_same_material_code_and_description(self):
        create_item = lambda: ItemFactory(material_code='C234', description='description')
        create_item()
        self.assertRaises(IntegrityError, create_item)
