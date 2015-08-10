from unittest import TestCase

from eums.fixtures.questions import seed_questions_and_flows
from eums.models import MultipleChoiceQuestion, ConsigneeItem, Item, MultipleChoiceAnswer
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory


class UpdateConsigneeInventoryTest(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.flows = seed_questions_and_flows()

    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.item = ItemFactory()
        self.node = DeliveryNodeFactory(consignee=self.consignee, item=PurchaseOrderItemFactory(item=self.item))
        self.was_item_received = MultipleChoiceQuestion.objects.get(label='itemReceived', flow=self.flows['WEB_FLOW'])
        self.yes = self.was_item_received.option_set.get(text='Yes')
        self.no = self.was_item_received.option_set.get(text='No')

    def tearDown(self):
        Item.objects.all().delete()
        ConsigneeItem.objects.all().delete()
        MultipleChoiceAnswer.objects.all().delete()

    def test_should_create_new_consignee_items_entry_when_new_item_is_received_by_ip(self):
        self.assertFalse(ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists())

        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))

        consignee_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertEqual(consignee_item_entry.amount_distributed, 0)
        self.assertEqual(consignee_item_entry.amount_received, 0)
        self.assertEqual(consignee_item_entry.deliveries, [self.node.id])

    def test_should_only_update_deliveries_when_item_is_received_again_by_ip(self):
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))
        consignee_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertEqual(consignee_item_entry.deliveries, [self.node.id])

        new_node = DeliveryNodeFactory(consignee=self.consignee, item=PurchaseOrderItemFactory(item=self.item))
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=new_node))

        updated_consignee_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertItemsEqual(updated_consignee_item_entry.deliveries, [self.node.id, new_node.id])

    def test_should_not_create_new_consignee_items_entry_when_new_item_is_not_received_by_ip(self):
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.no, run=RunFactory(runnable=self.node))
        self.assertFalse(ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists())

    def test_should_remove_consignee_items_entry_when_the_only_delivery_attached_is_edited_to_being_unreceived(self):
        item_was_received = MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes,
                                                        run=RunFactory(runnable=self.node))
        consignee_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertEqual(consignee_item_entry.deliveries, [self.node.id])

        item_was_received.value = self.no
        item_was_received.save()

        self.assertFalse(ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists())

    def test_should_remove_item_entry_when_a_new_no_answer_is_received_for_the_only_delivery_for_the_item(self):
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))
        consignee_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertEqual(consignee_item_entry.deliveries, [self.node.id])

        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.no, run=RunFactory(runnable=self.node))
        self.assertFalse(ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists())

    def test_should_remove_node_from_item_entry_when_that_node_is_modified_to_be_unreceived(self):
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))
        new_node = DeliveryNodeFactory(consignee=self.consignee, item=PurchaseOrderItemFactory(item=self.item))
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=new_node))
        updated_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertItemsEqual(updated_item_entry.deliveries, [self.node.id, new_node.id])

        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.no, run=RunFactory(runnable=self.node))
        updated_item_entry = ConsigneeItem.objects.get(consignee=self.consignee, item=self.item)
        self.assertItemsEqual(updated_item_entry.deliveries, [new_node.id])

    def test_should_only_add_node_once_to_item_entry_when_two_yes_answers_are_received(self):
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))
        MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes, run=RunFactory(runnable=self.node))
        self.assertEqual(ConsigneeItem.objects.get(consignee=self.consignee, item=self.item).deliveries, [self.node.id])

    def test_should_delete_item_entry_when_the_only_yes_answer_on_a_node_is_deleted(self):
        yes_answer = MultipleChoiceAnswerFactory(question=self.was_item_received, value=self.yes,
                                                 run=RunFactory(runnable=self.node))
        self.assertEqual(ConsigneeItem.objects.get(consignee=self.consignee, item=self.item).deliveries, [self.node.id])
        yes_answer.delete()

        self.assertFalse(ConsigneeItem.objects.filter(consignee=self.consignee, item=self.item).exists())

    '''
        ? What should we do if an answer saying a node was not received is deleted, and there are other answers on the
         node that say it was received? What is the ordering for an answer?
    '''
