from unittest import TestCase
from eums.fixtures.questions import seed_questions_and_flows
from eums.models import NumericQuestion, Item, ConsigneeItem, NumericAnswer, MultipleChoiceQuestion
from eums.test.factories.answer_factory import NumericAnswerFactory, MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory


class UpdateConsigneeStockLevelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.flows = seed_questions_and_flows()

    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.item = ItemFactory()
        self.node = DeliveryNodeFactory(consignee=self.consignee, item=PurchaseOrderItemFactory(item=self.item))
        self.amount_received = NumericQuestion.objects.get(label='amountReceived', flow=self.flows['WEB_FLOW'])
        self.was_item_received = MultipleChoiceQuestion.objects.get(label='itemReceived', flow=self.flows['WEB_FLOW'])
        self.yes = self.was_item_received.option_set.get(text='Yes')
        self.run = RunFactory(runnable=self.node)
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=self.run)

    def tearDown(self):
        Item.objects.all().delete()
        ConsigneeItem.objects.all().delete()
        NumericAnswer.objects.all().delete()

    def test_should_add_quantity_received_to_stock_if_amount_received_question_has_not_been_answered_yet(self):
        self.assertEqual(self._get_consignee_item().amount_received, 0)
        NumericAnswerFactory(question=self.amount_received, value=100, run=self.run)
        self.assertEqual(self._get_consignee_item().amount_received, 100)

    def test_should_reduce_quantity_received_when_answer_to_amount_received_is_deleted(self):
        answer = NumericAnswerFactory(question=self.amount_received, value=100, run=self.run)
        answer.delete()
        self.assertEqual(self._get_consignee_item().amount_received, 0)

    def test_should_update_quantity_received_when_amount_received_answer_value_is_updated(self):
        answer = NumericAnswerFactory(question=self.amount_received, value=100, run=self.run)
        answer.value = 75
        answer.save()
        self.assertEqual(self._get_consignee_item().amount_received, 75)

    def _get_consignee_item(self):
        return ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)


class UpdateConsigneeStockLevelTestWithoutAnsweringItemReceivedQuestion(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.flows = seed_questions_and_flows()

    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.item = ItemFactory()
        self.node = DeliveryNodeFactory(consignee=self.consignee, item=PurchaseOrderItemFactory(item=self.item))
        self.amount_received = NumericQuestion.objects.get(label='amountReceived', flow=self.flows['WEB_FLOW'])
        self.run = RunFactory(runnable=self.node)

    def test_should_throw_an_error_when_amount_received_question_is_answered_before_the_item_received_question(self):
        create_answer = lambda: NumericAnswerFactory(question=self.amount_received, value=100, run=self.run)
        self.assertRaises(AssertionError, create_answer)

    def tearDown(self):
        Item.objects.all().delete()
        ConsigneeItem.objects.all().delete()
        NumericAnswer.objects.all().delete()
