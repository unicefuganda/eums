from unittest import TestCase

from django.conf import settings
from mock import patch

from eums.models import Run, PurchaseOrderItem, Alert
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as NodeFactory, \
    DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import NumericQuestionFactory, MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class RunnableTest(TestCase):
    def setUp(self):
        self.node = DeliveryNodeFactory()

    @patch('requests.get')
    def test_should_build_contact_with_details_from_contacts_service(self, mock_get):
        contact_id = '54335c56b3ae9d92f038abb0'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439", '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        node = NodeFactory(contact_person_id=contact_id)
        mock_get.return_value = fake_response

        contact = node.build_contact()

        self.assertEqual(contact, fake_contact_json)
        mock_get.assert_called_with(url="%s%s" % (settings.CONTACTS_SERVICE_URL, contact_id))

    def test_gets_all_response_for_node_consignee(self):
        multichoice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = OptionFactory(text='Yes', question=multichoice_question)
        no_option = OptionFactory(text='No', question=multichoice_question)

        sugar = ItemFactory(description='Sugar')
        salt = ItemFactory(description='Salt')

        numeric_question = NumericQuestionFactory(label='AmountReceived')
        item = SalesOrderItemFactory(item=salt, description='10 bags of salt')

        salt_node = DeliveryNodeFactory(quantity=100, item=PurchaseOrderItemFactory(sales_order_item=item))
        run = RunFactory(runnable=salt_node, status='completed')

        sugar_item = SalesOrderItemFactory(item=sugar, description='10 bags of sugar')
        sugar_node = DeliveryNodeFactory(quantity=100, item=PurchaseOrderItemFactory(sales_order_item=sugar_item))
        sugar_run = RunFactory(runnable=sugar_node, status='completed')

        multiple_answer_one = MultipleChoiceAnswerFactory(run=run, question=multichoice_question, value=yes_option)
        numeric_answer_one = NumericAnswerFactory(run=run, value=80, question=numeric_question)

        multiple_answer_two = MultipleChoiceAnswerFactory(run=sugar_run, question=multichoice_question, value=no_option)
        numeric_answer_two = NumericAnswerFactory(run=sugar_run, value=80, question=numeric_question)
        salt_node_responses = salt_node.responses()
        sugar_node_responses = sugar_node.responses()

        self.assertIn(multiple_answer_one, salt_node_responses[run])
        self.assertIn(numeric_answer_one, salt_node_responses[run])

        self.assertIn(multiple_answer_two, sugar_node_responses[sugar_run])
        self.assertIn(numeric_answer_two, sugar_node_responses[sugar_run])

    def test_should_get_run_with_status_scheduled(self):
        run = RunFactory(runnable=self.node, status=Run.STATUS.scheduled)
        self.assertEqual(self.node.current_run(), run)

    def test_should_not_get_run_with_status_completed(self):
        RunFactory(runnable=self.node, status=Run.STATUS.completed)
        self.assertEqual(self.node.current_run(), None)

    def test_should_not_get_run_with_status_expired(self):
        RunFactory(runnable=self.node, status=Run.STATUS.expired)
        self.assertEqual(self.node.current_run(), None)

    def test_should_not_get_run_with_status_cancelled(self):
        RunFactory(runnable=self.node, status=Run.STATUS.cancelled)
        self.assertEqual(self.node.current_run(), None)

    def test_should_get_the_completed_run(self):
        self.assertIsNone(self.node.completed_run())
        run = RunFactory(runnable=self.node, status=Run.STATUS.completed)
        self.assertEqual(self.node.completed_run(), run)

    def test_should_get_latest_run(self):
        first_run = RunFactory(runnable=self.node)
        self.assertEqual(self.node.latest_run(), first_run)
        second_run = RunFactory(runnable=self.node)
        self.assertEqual(self.node.latest_run(), second_run)

    def test_should_get_latest_response(self):
        multichoice_question = MultipleChoiceQuestionFactory(label='productReceived')
        no_option = OptionFactory(text='No', question=multichoice_question)

        sugar = ItemFactory(description='Sugar')

        numeric_question = NumericQuestionFactory(label='AmountReceived')

        node = DeliveryNodeFactory(quantity=100, item=PurchaseOrderItemFactory(item=sugar))
        run = RunFactory(runnable=node, status='completed')

        self.assertIsNone(node.latest_response())

        multiple_answer = MultipleChoiceAnswerFactory(run=run, question=multichoice_question, value=no_option)
        self.assertEqual(node.latest_response(), multiple_answer)

        numeric_answer = NumericAnswerFactory(run=run, value=80, question=numeric_question)
        self.assertEqual(node.latest_response(), numeric_answer)

    @patch('eums.models.runnable.Runnable.build_contact')
    def test_should_create_alert(self, mock_contact):
        purchase_order = PurchaseOrderFactory(order_number=5678)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")

        contact_person_id = 'some_id'
        contact = {u'_id': contact_person_id,
                   u'firstName': u'Chris',
                   u'lastName': u'George',
                   u'phone': u'+256781111111'}
        mock_contact.return_value = contact

        delivery = DeliveryFactory(consignee=consignee, contact_person_id=contact_person_id)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        delivery.create_alert(Alert.ISSUE_TYPES.not_received)

        alerts = Alert.objects.filter(consignee_name="Liverpool FC", order_number=5678)
        self.assertEqual(alerts.count(), 1)
        alert = alerts.first()
        self.assertEqual(alert.order_type, PurchaseOrderItem.PURCHASE_ORDER)
        self.assertEqual(alert.order_number, 5678)
        self.assertEqual(alert.consignee_name, "Liverpool FC")
        self.assertEqual(alert.contact['contact_name'], "Chris George")
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.not_received)
        self.assertFalse(alert.is_resolved)
        self.assertIsNone(alert.remarks)
        self.assertEqual(alert.runnable.id, delivery.id)
        self.assertIsNone(alert.item_description)
