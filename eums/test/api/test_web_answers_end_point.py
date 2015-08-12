import json
from mock import MagicMock
from eums.models import MultipleChoiceAnswer, TextAnswer, TextQuestion, MultipleChoiceQuestion, Runnable, Flow, Run, \
    NumericAnswer
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import TextQuestionFactory, MultipleChoiceQuestionFactory, \
    NumericQuestionFactory

ENDPOINT_URL = BACKEND_URL + 'web-answers'


class WebAnswerEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(WebAnswerEndpointTest, self).setUp()
        self.setup_flow_with_questions(Runnable.IMPLEMENTING_PARTNER)
        self.build_contact = Runnable.build_contact
        contact = {'name': 'Some name', 'phone': '098765433'}
        Runnable.build_contact = MagicMock(return_value=contact)

    def setup_flow_with_questions(self, flow_type):
        flow = FlowFactory(for_runnable_type=flow_type)
        delivery_received_qn = MultipleChoiceQuestionFactory(label='deliveryReceived', flow=flow)
        OptionFactory(question=delivery_received_qn, text='Yes')
        OptionFactory(question=delivery_received_qn, text='No')
        TextQuestionFactory(label='dateOfReceipt', flow=flow)
        good_order_qn = MultipleChoiceQuestionFactory(label='isDeliveryInGoodOrder', flow=flow)
        OptionFactory(question=good_order_qn, text='Yes')
        OptionFactory(question=good_order_qn, text='No')
        OptionFactory(question=good_order_qn, text='Incomplete')
        satisfied_qn = MultipleChoiceQuestionFactory(label='areYouSatisfied', flow=flow)
        OptionFactory(question=satisfied_qn, text='Yes')
        OptionFactory(question=satisfied_qn, text='No')
        TextQuestionFactory(label='additionalDeliveryComments', flow=flow)

    def tearDown(self):
        MultipleChoiceQuestion.objects.all().delete()
        TextQuestion.objects.all().delete()
        Flow.objects.all().delete()
        Runnable.build_contact = self.build_contact

    def test_should_save_answers(self):
        delivery = DeliveryFactory()
        date_of_receipt = '10-10-2014'
        good_comment = "All is good"

        data = {
            'runnable': delivery.id, 'answers': [
                {'question_label': 'deliveryReceived', 'value': 'Yes'},
                {'question_label': 'dateOfReceipt', 'value': date_of_receipt},
                {'question_label': 'isDeliveryInGoodOrder', 'value': 'Yes'},
                {'question_label': 'areYouSatisfied', 'value': 'Yes'},
                {'question_label': 'additionalDeliveryComments', 'value': good_comment}
            ]}

        response = self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        answer_for_delivery_received = self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'deliveryReceived')
        answer_for_date_of_receipt = self._get_answer_for(TextAnswer, delivery.id, 'dateOfReceipt')
        answer_for_delivery_order = self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'isDeliveryInGoodOrder')
        answer_for_satisfaction = self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'areYouSatisfied')
        answer_for_additional_comments = self._get_answer_for(TextAnswer, delivery.id, 'additionalDeliveryComments')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(answer_for_delivery_received.value.text, 'Yes')
        self.assertEqual(answer_for_date_of_receipt.value, date_of_receipt)
        self.assertEqual(answer_for_delivery_order.value.text, 'Yes')
        self.assertEqual(answer_for_satisfaction.value.text, 'Yes')
        self.assertEqual(answer_for_additional_comments.value, good_comment)

    def test_should_cancel_existing_runs_when_saving_a_new_set_of_answers(self):
        delivery = DeliveryFactory()

        data = {
            'runnable': delivery.id, 'answers': [
                {'question_label': 'deliveryReceived', 'value': 'Yes'}
            ]}

        self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        runs = Run.objects.filter(runnable=delivery)
        self.assertEqual(len(runs), 1)

        self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        runs = Run.objects.filter(runnable=delivery)

        self.assertEqual(len(runs), 2)
        self.assertEqual(len(Run.objects.filter(runnable=delivery, status='cancelled')), 1)
        self.assertEqual(len(Run.objects.filter(runnable=delivery, status='completed')), 1)

    def test_should_save_delivery_node_answers(self):
        self.setup_flow_with_questions(Runnable.WEB)
        node = DeliveryNodeFactory()
        date_of_receipt = '10-10-2014'
        data = {
            'runnable': node.id, 'answers': [
                {'question_label': 'deliveryReceived', 'value': 'Yes'},
                {'question_label': 'dateOfReceipt', 'value': date_of_receipt}
            ]}

        self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        runs = Run.objects.filter(runnable=node)
        self.assertEqual(len(runs), 1)
        self.assertEqual(len(TextAnswer.objects.filter(run__runnable=node)), 1)
        self.assertEqual(len(MultipleChoiceAnswer.objects.filter(run__runnable=node)), 1)

    def test_should_save_delivery_node_answers_to_web_flow(self):
        self.setup_flow_with_questions(Runnable.WEB)
        node = DeliveryNodeFactory()

        date_of_receipt = '10-10-2014'
        data = {
            'runnable': node.id, 'answers': [
                {'question_label': 'deliveryReceived', 'value': 'Yes'},
                {'question_label': 'dateOfReceipt', 'value': date_of_receipt}
            ]}

        self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        web_flow = Flow.objects.get(for_runnable_type=Runnable.WEB)
        self.assertEqual(len(TextAnswer.objects.filter(question__flow=web_flow)), 1)
        self.assertEqual(len(MultipleChoiceAnswer.objects.filter(question__flow=web_flow)), 1)

    def test_should_save_numeric_answers(self):
        self.setup_flow_with_questions(Runnable.WEB)
        web_flow = Flow.objects.filter(for_runnable_type=Runnable.WEB).first()
        NumericQuestionFactory(label='quantityDelivered', flow=web_flow)

        node = DeliveryNodeFactory()
        data = {
            'runnable': node.id, 'answers': [
                {'question_label': 'deliveryReceived', 'value': 'Yes'},
                {'question_label': 'quantityDelivered', 'value': 2}
            ]}

        self.client.post(ENDPOINT_URL, data=json.dumps(data), content_type='application/json')

        self.assertEqual(len(NumericAnswer.objects.filter(question__flow=web_flow)), 1)


def _get_answer_for(self, answer_type, delivery_id, question_label):
    return answer_type.objects.filter(run__runnable=delivery_id, question__label=question_label).first()
