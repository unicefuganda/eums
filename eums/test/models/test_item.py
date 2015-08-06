from unittest import TestCase
from django.db import IntegrityError

from eums.models import Item, Consignee
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class ItemTest(TestCase):
    def setUp(self):
        Item.objects.all().delete()

    @classmethod
    def tearDownClass(cls):
        Item.objects.all().delete()
        Consignee.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_item = [field for field in Item._meta._name_map]

        self.assertEquals(len(Item._meta.fields), 4)

        for field in ['description', 'unit_id', 'material_code']:
            self.assertIn(field, fields_in_item)

    def test_no_two_items_should_have_the_same_material_code_and_description(self):
        create_item = lambda: ItemFactory(material_code='C234', description='description')
        create_item()
        self.assertRaises(IntegrityError, create_item)

    def test_should_list_all_items_delivered_to_a_consignee(self):
        item_one = ItemFactory()
        item_two = ItemFactory()
        item_three = ItemFactory()
        po_item = PurchaseOrderItemFactory(item=item_one)
        ro_item = ReleaseOrderItemFactory(item=item_two)
        consignee = ConsigneeFactory()
        DeliveryNodeFactory(item=po_item, consignee=consignee)
        DeliveryNodeFactory(item=ro_item, consignee=consignee)

        consignee_items = Item.objects.delivered_to_consignee(consignee)

        self.assertEqual(consignee_items.count(), 2)
        self.assertIn(item_one, consignee_items)
        self.assertIn(item_two, consignee_items)
        self.assertNotIn(item_three, consignee_items)

