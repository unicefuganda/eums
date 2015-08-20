from unittest import TestCase

from eums.models import DistributionPlan as Delivery, SalesOrder, DistributionPlanNode as DeliveryNode, \
    MultipleChoiceQuestion, Run, Flow, Option
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory


class DeliveryTest(TestCase):
    @classmethod
    def clean_up(cls):
        Flow.objects.all().delete()
        SalesOrder.objects.all().delete()
        Delivery.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

    @classmethod
    def setUpClass(cls):
        cls.clean_up()

    def setUp(self):
        self.po_item_one = PurchaseOrderItemFactory(value=400, quantity=200)
        self.po_item_two = PurchaseOrderItemFactory(value=600, quantity=100)

        self.delivery = DeliveryFactory()
        self.node_one = DeliveryNodeFactory(distribution_plan=self.delivery, item=self.po_item_one, quantity=50)
        DeliveryNodeFactory(distribution_plan=self.delivery, item=self.po_item_two, quantity=30)

    def tearDown(self):
        self.clean_up()

    def test_should_have_all_expected_fields(self):
        delivery = DeliveryFactory()
        for expected_field in ['programme', 'date', 'confirmed']:
            self.assertTrue(hasattr(delivery, expected_field))

    def test_should_compute_total_value_delivered_from_order_item_values(self):
        self.assertEqual(self.delivery.total_value(), 280)

    def test_should_ignore_child_nodes_value_when_computing_total_value(self):
        DeliveryNodeFactory(parents=[(self.node_one, 10)], item=self.po_item_one, distribution_plan=self.delivery)
        self.assertEqual(self.delivery.total_value(), 280)

    def test_should_return_false_when_delivery_is_not_received(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='No', question=question)
        run = RunFactory(runnable=delivery)

        self.assertFalse(delivery.is_received())

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertFalse(delivery.is_received())

    def test_should_return_false_when_delivery_is_received_but_no_answers_have_been_received_for_its_nodes(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)

        run = RunFactory(runnable=delivery)

        DeliveryNodeFactory(distribution_plan=delivery)
        DeliveryNodeFactory(distribution_plan=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertFalse(delivery.is_received())

    def test_should_return_false_when_delivery_is_received_and_there_are_no_answers_for_some_nodes(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        node_one = DeliveryNodeFactory(distribution_plan=delivery)
        DeliveryNodeFactory(distribution_plan=delivery)

        item_question = MultipleChoiceQuestionFactory(label='itemReceived')
        yes_node_option = OptionFactory(text='Yes', question=item_question)
        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_one), question=item_question, value=yes_node_option)

        self.assertFalse(delivery.is_received())

    def test_should_return_false_when_delivery_is_received_and_some_nodes_are_not_received(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        node_one = DeliveryNodeFactory(distribution_plan=delivery)
        node_two = DeliveryNodeFactory(distribution_plan=delivery)

        item_question = MultipleChoiceQuestionFactory(label='itemReceived')
        yes_node_option = OptionFactory(text='Yes', question=item_question)
        no_node_option = OptionFactory(text='No', question=item_question)
        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_one), question=item_question, value=yes_node_option)
        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_two), question=item_question, value=no_node_option)

        self.assertFalse(delivery.is_received())

    def test_should_return_true_when_delivery_is_received_and_all_node_answers_are_received(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        node_one = DeliveryNodeFactory(distribution_plan=delivery)
        node_two = DeliveryNodeFactory(distribution_plan=delivery)

        item_question = MultipleChoiceQuestionFactory(label='itemReceived')
        option_two = OptionFactory(text='Yes', question=item_question)
        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_one), question=item_question, value=option_two)
        MultipleChoiceAnswerFactory(run=RunFactory(runnable=node_two), question=item_question, value=option_two)

        self.assertTrue(delivery.is_received())

    def test_should_mirror_delivery_tracked_status_on_all_nodes_when_tracked_status_changes_on_delivery(self):
        Delivery.objects.all().delete()
        delivery = DeliveryFactory(track=False)
        root_node = DeliveryNodeFactory(distribution_plan=delivery)
        child_node = DeliveryNodeFactory(distribution_plan=delivery, parents=[(root_node, 5)])

        self.assertFalse(root_node.track)
        self.assertFalse(child_node.track)

        delivery.track = True
        delivery.save()
        self.assertTrue(DeliveryNode.objects.get(pk=root_node.id).track)
        self.assertTrue(DeliveryNode.objects.get(pk=child_node.id).track)

        delivery.track = False
        delivery.save()
        self.assertFalse(DeliveryNode.objects.get(pk=root_node.id).track)
        self.assertFalse(DeliveryNode.objects.get(pk=child_node.id).track)

    def test_should_return_false_when_delivery_has_no_answer_at_all(self):
        delivery = DeliveryFactory()

        self.assertFalse(delivery.is_received())

    def test_should_return_false_when_delivery_run_was_cancelled(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery, status=Run.STATUS.cancelled)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)
        self.assertFalse(delivery.is_received())

    def test_should_return_delivery_type_purchase_order(self):
        po_item = PurchaseOrderItemFactory()
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item)

        self.assertEqual(delivery.type(), 'Purchase Order')

    def test_should_return_delivery_type_waybill(self):
        ro_item = ReleaseOrderItemFactory()
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=ro_item)

        self.assertEqual(delivery.type(), 'Waybill')

    def test_should_return_delivery_type_unknown(self):
        delivery = DeliveryFactory()

        self.assertEqual(delivery.type(), 'Unknown')

    def test_should_return_delivery_with_order_number(self):
        po = PurchaseOrderFactory(order_number=123456)
        po_item = PurchaseOrderItemFactory(purchase_order=po)
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item)

        self.assertEqual(delivery.number(), 123456)

    def test_should_return_delivery_with_waybill_number(self):
        release_order = ReleaseOrderFactory(waybill=98765)
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=release_order_item)

        self.assertEqual(delivery.number(), 98765)

    def test_should_return_number_of_items_on_a_delivery(self):
        po = PurchaseOrderFactory(order_number=123456)
        po_item_one = PurchaseOrderItemFactory(purchase_order=po)
        po_item_two = PurchaseOrderItemFactory(purchase_order=po)
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item_one)

        self.assertEqual(delivery.number_of_items(), 1)

        DeliveryNodeFactory(distribution_plan=delivery, item=po_item_two)
        self.assertEqual(delivery.number_of_items(), 2)

    def test_should_return_answers_for_delivery(self):
        delivery = DeliveryFactory()
        flow = FlowFactory(for_runnable_type='IMPLEMENTING_PARTNER')

        question_1 = MultipleChoiceQuestionFactory(label='deliveryReceived', flow=flow, text='Was Delivery Received?')
        question_2 = TextQuestionFactory(label='dateOfReceipt', flow=flow, text='When was Delivery Received?')
        question_3 = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=flow)

        option_yes = OptionFactory(text='Yes', question=question_1)

        run = RunFactory(runnable=delivery)

        multiple_choice_answer = MultipleChoiceAnswerFactory(run=run, question=question_1, value=option_yes)
        text_answer = TextAnswerFactory(run=run, question=question_2, value='2015-10-10')
        numeric_answer = NumericAnswerFactory(run=run, question=question_3, value=10)

        expected_multiple_choice_answer = {
            'question_label': question_1.label,
            'type': 'multipleChoice',
            'text': question_1.text,
            'value': multiple_choice_answer.value.text,
            'options': ['Yes'],
            'position': question_1.position
        }
        expected_text_answer = {
            'question_label': question_2.label,
            'type': 'text',
            'text': question_2.text,
            'value': text_answer.value,
            'position': question_2.position
        }
        expected_numeric_answer = {
            'question_label': question_3.label,
            'type': 'numeric',
            'text': question_3.text,
            'value': numeric_answer.value,
            'position': question_3.position
        }
        answers = delivery.answers()

        self.assertEqual(len(answers), 3)
        self.assertIn(expected_multiple_choice_answer, answers)
        self.assertIn(expected_text_answer, answers)
        self.assertIn(expected_numeric_answer, answers)

    def test_should_return_default_answers_for_delivery(self):
        delivery = DeliveryFactory()
        flow = FlowFactory(for_runnable_type='IMPLEMENTING_PARTNER')

        question_1 = MultipleChoiceQuestionFactory(label='deliveryReceived', flow=flow, text='Was Delivery Received?')
        question_2 = TextQuestionFactory(label='dateOfReceipt', flow=flow, text='When was Delivery Received?')

        OptionFactory(text='Yes', question=question_1)

        RunFactory(runnable=delivery)

        expected_multiple_choice_answer = {
            'question_label': question_1.label,
            'type': 'multipleChoice',
            'text': question_1.text,
            'value': '',
            'options': ['Yes'],
            'position': question_1.position
        }
        expected_text_answer = {
            'question_label': question_2.label,
            'type': 'text',
            'text': question_2.text,
            'value': '',
            'position': question_2.position
        }
        answers = delivery.answers()

        self.assertEqual(len(answers), 2)
        self.assertIn(expected_multiple_choice_answer, answers)
        self.assertIn(expected_text_answer, answers)

    def test_should_return_answers_for_delivery_in_the_same_order_as_flow(self):
        delivery = DeliveryFactory()
        flow = FlowFactory(for_runnable_type='IMPLEMENTING_PARTNER')

        question_1 = MultipleChoiceQuestionFactory(label='deliveryReceived',
                                                   flow=flow, text='Was Delivery Received?', position=3)
        question_2 = TextQuestionFactory(label='dateOfReceipt',
                                         flow=flow, text='When was Delivery Received?', position=1)
        question_3 = TextQuestionFactory(label='satisfiedWithProduct',
                                         flow=flow, text='Are you satisfied with product?', position=2)

        OptionFactory(text='No', question=question_1)
        OptionFactory(text='Yes', question=question_1)

        RunFactory(runnable=delivery)

        answers = delivery.answers()

        self.assertEqual(len(answers), 3)
        self.assertEqual(question_2.label, answers[0]['question_label'])
        self.assertEqual(question_3.label, answers[1]['question_label'])
        self.assertEqual(question_1.label, answers[2]['question_label'])

    def test_should_return_answers_for_completed_or_scheduled_runs_only(self):
        delivery = DeliveryFactory()
        flow = FlowFactory(for_runnable_type='IMPLEMENTING_PARTNER')

        question_1 = MultipleChoiceQuestionFactory(label='deliveryReceived',
                                                   flow=flow, text='Was Delivery Received?', position=3)
        question_2 = TextQuestionFactory(label='dateOfReceipt',
                                         flow=flow, text='When was Delivery Received?', position=1)
        question_3 = TextQuestionFactory(label='satisfiedWithProduct',
                                         flow=flow, text='Are you satisfied with product?', position=2)

        option_no = OptionFactory(text='No', question=question_1)
        option_yes = OptionFactory(text='Yes', question=question_1)

        run_one = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(question=question_1, value=option_no, run=run_one)
        TextAnswerFactory(question=question_2, value="2014-10-10", run=run_one)
        TextAnswerFactory(question=question_3, value="yup", run=run_one)

        answers = delivery.answers()

        self.assertEqual(len(answers), 3)
        self.assertEqual(answers[0]['value'], '2014-10-10')

        run_one.status = 'cancelled'
        run_one.save()

        answers = delivery.answers()

        self.assertEqual(len(answers), 3)
        self.assertEqual(answers[0]['value'], '')

        run_two = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(question=question_1, value=option_yes, run=run_two)
        answers = delivery.answers()

        self.assertEqual(len(answers), 3)
        self.assertEqual(answers[0]['value'], '')
        self.assertEqual(answers[1]['value'], '')
        self.assertEqual(answers[2]['value'], 'Yes')

    def test_should_return_answers_for_all_first_level_nodes_in_a_delivery(self):
        delivery = DeliveryFactory()
        node_one = DeliveryNodeFactory(distribution_plan=delivery)
        node_two = DeliveryNodeFactory(distribution_plan=delivery)

        flow = FlowFactory(for_runnable_type='WEB')

        question_1 = MultipleChoiceQuestionFactory(text='Was the item received?', label='itemReceived', flow=flow,
                                                   position=1)
        option_1 = OptionFactory(text='Yes', question=question_1)

        question_2 = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=flow)

        question_3 = MultipleChoiceQuestionFactory(text='What is the quality of the product?', label='qualityOfProduct',
                                                   flow=flow, position=3)
        option_3 = OptionFactory(text='Damaged', question=question_3)

        question_4 = MultipleChoiceQuestionFactory(text='Are you satisfied with the product?',
                                                   label='satisfiedWithProduct', flow=flow, position=4)
        option_4 = OptionFactory(text='Yes', question=question_4)

        question_5 = TextQuestionFactory(text='Remarks', label='additionalDeliveryComments',
                                         flow=flow, position=5)
        run_one = RunFactory(runnable=node_one)
        MultipleChoiceAnswerFactory(question=question_1, run=run_one, value=option_1)
        NumericAnswerFactory(question=question_2, run=run_one, value=5)
        MultipleChoiceAnswerFactory(question=question_3, run=run_one, value=option_3)
        MultipleChoiceAnswerFactory(question=question_4, run=run_one, value=option_4)
        TextAnswerFactory(question=question_5, run=run_one, value="Answer")

        run_two = RunFactory(runnable=node_two)
        MultipleChoiceAnswerFactory(question=question_1, run=run_two, value=option_1)
        NumericAnswerFactory(question=question_2, run=run_two, value=3)
        MultipleChoiceAnswerFactory(question=question_3, run=run_two, value=option_3)
        MultipleChoiceAnswerFactory(question=question_4, run=run_two, value=option_4)
        TextAnswerFactory(question=question_5, run=run_two, value="Answer")

        node_answers = delivery.node_answers()

        expected_multiple_choice_answer = {
            'question_label': question_1.label,
            'type': 'multipleChoice',
            'text': question_1.text,
            'value': 'Yes',
            'options': ['Yes'],
            'position': question_1.position
        }
        expected_text_answer = {
            'question_label': question_5.label,
            'type': 'text',
            'text': question_5.text,
            'value': 'Answer',
            'position': question_5.position
        }

        self.assertEqual(len(node_answers), 2)

        self.assertIn(node_answers[0]['id'], [node_one.id, node_two.id])
        self.assertEqual(len(node_answers[0]['answers']), 5)
        self.assertIn(expected_multiple_choice_answer, node_answers[0]['answers'])

        self.assertIn(node_answers[1]['id'], [node_one.id, node_two.id])
        self.assertEqual(len(node_answers[1]['answers']), 5)
        self.assertIn(expected_text_answer, node_answers[1]['answers'])