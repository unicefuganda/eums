import json
from mock import MagicMock
from eums.models import MultipleChoiceAnswer, TextAnswer, TextQuestion, MultipleChoiceQuestion, Runnable
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import TextQuestionFactory, MultipleChoiceQuestionFactory

ENDPOINT_URL = BACKEND_URL + 'web-answers'


class WebAnswerEndpointTest(AuthenticatedAPITestCase):

    def setUp(self):
        super(WebAnswerEndpointTest, self).setUp()
        delivery_received_qn = MultipleChoiceQuestionFactory(label='deliveryReceived')
        OptionFactory(question=delivery_received_qn, text='Yes')
        OptionFactory(question=delivery_received_qn, text='No')

        TextQuestionFactory(label='dateOfReceiptOfDelivery')

        good_order_qn = MultipleChoiceQuestionFactory(label='isDeliveryInGoodOrder')
        OptionFactory(question=good_order_qn, text='Yes')
        OptionFactory(question=good_order_qn, text='No')
        OptionFactory(question=good_order_qn, text='Incomplete')

        satisfied_qn = MultipleChoiceQuestionFactory(label='areYouSatisfied')
        OptionFactory(question=satisfied_qn, text='Yes')
        OptionFactory(question=satisfied_qn, text='No')

        TextQuestionFactory(label='additionalDeliveryComments')
        self.build_contact = Runnable.build_contact
        contact = {'name': 'Some name', 'phone': '098765433'}
        Runnable.build_contact = MagicMock(return_value=contact)

    def tearDown(self):
        MultipleChoiceQuestion.objects.all().delete()
        TextQuestion.objects.all().delete()
        Runnable.build_contact = self.build_contact

    def test_should_save_answers(self):
        delivery = DeliveryFactory()
        date_of_receipt = '10-10-2014'
        good_comment = "All is good"

        response = self.client.post(ENDPOINT_URL, {'delivery': delivery.id, 'answers': [
            {'question_label': 'deliveryReceived', 'value': 'Yes'},
            {'question_label': 'dateOfReceiptOfDelivery', 'value': date_of_receipt},
            {'question_label': 'isDeliveryInGoodOrder', 'value': 'Yes'},
            {'question_label': 'areYouSatisfied', 'value': 'Yes'},
            {'question_label': 'additionalDeliveryComments', 'value': good_comment}
        ]})

        answer_for_delivery_received = self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'deliveryReceived')
        answer_for_date_of_receipt = self._get_answer_for(TextAnswer, delivery.id, 'dateOfReceiptOfDelivery')
        answer_for_delivery_order= self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'isDeliveryInGoodOrder')
        answer_for_satisfaction = self._get_answer_for(MultipleChoiceAnswer, delivery.id, 'areYouSatisfied')
        answer_for_additional_comments = self._get_answer_for(TextAnswer, delivery.id, 'additionalDeliveryComments')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(answer_for_delivery_received.value.text, 'Yes')
        self.assertEqual(answer_for_date_of_receipt.value, date_of_receipt)
        self.assertEqual(answer_for_delivery_order.value.text, 'Yes')
        self.assertEqual(answer_for_satisfaction.value.text, 'Yes')
        self.assertEqual(answer_for_additional_comments.value, good_comment)

    def _get_answer_for(self, answer_type, delivery_id, question_label):
        return answer_type.objects.filter(run__runnable=delivery_id, question__label=question_label).first()
