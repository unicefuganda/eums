from unittest import TestCase

from django.db import IntegrityError

from eums.fixtures.questions import seed_questions_and_flows
from eums.models import Item, Consignee, Option, MultipleChoiceQuestion, Question, NumericQuestion
from eums.test.factories.item_factory import ItemFactory


class ItemTest(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.flows = seed_questions_and_flows()

    @classmethod
    def tearDownClass(cls):
        Item.objects.all().delete()
        Consignee.objects.all().delete()
        Question.objects.all().delete()

    def setUp(self):
        Item.objects.all().delete()
        self.web_flow = self.flows['WEB_FLOW']
        self.was_item_received = MultipleChoiceQuestion.objects.get(label='itemReceived', flow=self.web_flow)
        self.yes = Option.objects.get(text='Yes', question=self.was_item_received)
        self.no = Option.objects.get(text='No', question=self.was_item_received)
        self.amount_received = NumericQuestion.objects.get(label='amountReceived', flow=self.web_flow)

    def test_should_have_all_expected_fields(self):
        fields_in_item = [field for field in Item._meta._name_map]

        self.assertEquals(len(Item._meta.fields), 4)

        for field in ['description', 'unit_id', 'material_code']:
            self.assertIn(field, fields_in_item)

    def test_no_two_items_should_have_the_same_material_code_and_description(self):
        create_item = lambda: ItemFactory(material_code='C234', description='description')
        create_item()
        self.assertRaises(IntegrityError, create_item)
