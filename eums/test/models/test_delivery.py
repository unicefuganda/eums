from unittest import TestCase

from eums.models import DistributionPlan as Delivery, SalesOrder, DistributionPlanNode as DeliveryNode, \
    MultipleChoiceQuestion, Run
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory


class DeliveryTest(TestCase):
    @classmethod
    def clean_up(cls):
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
        fields_in_plan = Delivery()._meta._name_map

        for expected_field in ['programme_id']:
            self.assertIn(expected_field, fields_in_plan)

    def test_should_compute_total_value_delivered_from_order_item_values(self):
        self.assertEqual(self.delivery.total_value(), 280)

    def test_should_ignore_child_nodes_value_when_computing_total_value(self):
        DeliveryNodeFactory(parents=[(self.node_one, 10)], item=self.po_item_one, distribution_plan=self.delivery)
        self.assertEqual(self.delivery.total_value(), 280)

    def test_should_return_true_when_delivery_is_received(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertTrue(delivery.is_received())

    def test_should_return_false_when_delivery_is_not_received(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='No', question=question)
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertFalse(delivery.is_received())

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
