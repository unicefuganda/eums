import copy
import logging
import requests
from mock import patch, MagicMock
from rest_framework.test import APITestCase

from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.question_factory import TextQuestionFactory, NumericQuestionFactory, \
    MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.models import MultipleChoiceAnswer, TextAnswer, NumericAnswer, RunQueue, Run, Flow, \
    MultipleChoiceQuestion, Option, Alert, Runnable, DistributionPlanNode
from eums.test.config import BACKEND_URL
from eums.test.factories.flow_factory import FlowFactory
from eums.api.rapid_pro_hooks import hook as my_hook

logger = logging.getLogger(__name__)
HOOK_URL = BACKEND_URL + 'hook/'

FLOW_RESPONSE = {
    "results": [
        {
            "uuid": "b128ffd2-7ad8-4899-88ab-b7a863c623b5",
            "name": "IMPLEMENTING PARTNER",
            "labels": ['IMPLEMENTING_PARTNER'],
            "rulesets": [
                {
                    "node": "5b0f1f19-767f-47f1-97a5-b9b32c45a47c",
                    "id": 40551,
                    "response_type": "C",
                    "ruleset_type": "wait_message",
                    "label": "productReceived"
                },
                {
                    "node": "b3fad71f-ca0a-4212-b7f9-892dd3dc4c4b",
                    "id": 40553,
                    "response_type": "C",
                    "ruleset_type": "wait_message",
                    "label": "dateOfReceipt"
                },
                {
                    "node": "18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c",
                    "id": 40554,
                    "response_type": "C",
                    "ruleset_type": "wait_message",
                    "label": "amountReceived"
                }
            ],
            "flow": 2436
        }
    ]
}


class HookTest(AuthenticatedAPITestCase):
    def setUp(self):
        self.PHONE = '+12065551212'
        self.flow_id = 2436
        self.flow = FlowFactory(label=Flow.Label.IMPLEMENTING_PARTNER)
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=FLOW_RESPONSE)))
        self.my_hook = reload(my_hook)

    def tearDown(self):
        Alert.objects.all().delete()
        Run.objects.all().delete()
        Runnable.objects.all().delete()
        RunQueue.objects.all().delete()

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    def test_should_record_an_answer_of_type_multiple_choice_for_a_node_from_request_data(self, *_):
        uuid = '5b0f1f19-767f-47f1-97a5-b9b32c45a47c'

        question = MultipleChoiceQuestionFactory(text='Was product received?', label='productReceived', flow=self.flow)

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        delivery = DeliveryFactory()
        run = RunFactory(phone=self.PHONE, runnable=delivery)

        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, 'Yes', 'Yes', 'productReceived')

        response = self.client.post(HOOK_URL, url_params)

        expected_question = MultipleChoiceQuestion.objects.get(label='productReceived')
        yes_option = expected_question.option_set.get(text='Yes')

        answers = MultipleChoiceAnswer.objects.filter(question__label='productReceived', run=run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, yes_option)
        self.assertEqual(delivery.answers()[0]['value'], created_answer.value.text)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    def test_should_record_an_answer_of_type_multiple_choice_for_a_node_with_multiple_uuids_from_request_data(self, *_):
        uuids = ['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', 'abc9c005-7a7c-44f8-b946-e970a361b6cf']

        question = MultipleChoiceQuestionFactory(text='Was item received?', label='productReceived', flow=self.flow)

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        run = RunFactory(phone=self.PHONE)

        uuid_for_no = uuids[1]
        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid_for_no, 'No', 'No', 'productReceived')

        response = self.client.post(HOOK_URL, url_params)
        expected_question = MultipleChoiceQuestion.objects.get(label='productReceived')
        no_option = expected_question.option_set.get(text='No')

        answers = MultipleChoiceAnswer.objects.filter(question__label='productReceived', run=run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, no_option)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    def test_should_record_an_answer_of_type_text_for_a_node_from_request_data(self, *_):
        uuid = 'b3fad71f-ca0a-4212-b7f9-892dd3dc4c4b'

        TextQuestionFactory(text='What date was it received?', label='dateOfReceipt', flow=self.flow)

        run = RunFactory(phone=('%s' % self.PHONE))
        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, '21/12/2015', None, 'dateOfReceipt')

        response = self.client.post(HOOK_URL, url_params)

        answers = TextAnswer.objects.filter(question__label='dateOfReceipt', run=run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, '2015-12-21')

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    def test_should_record_an_answer_of_type_numeric_for_a_node_from_request_data(self, *_):
        uuid = '18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c'

        NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=self.flow)

        run = RunFactory(phone=('%s' % self.PHONE))
        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, 42, None, 'amountReceived')

        response = self.client.post(HOOK_URL, url_params)

        answers = NumericAnswer.objects.filter(question__label='amountReceived', run=run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, 42)


    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    @patch('eums.api.rapid_pro_hooks.hook._dequeue_next_run')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_dequeue_next_node_when_question_is_a_final_end_node(self, mock_run_queue_dequeue,
                                                                        mock_dequeue_next_run, *_):
        uuid = '18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c'
        question = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=self.flow)
        self.flow.final_end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        node = DeliveryNodeFactory()
        next_node = copy.deepcopy(node)
        current_run = RunFactory(runnable=node, phone=self.PHONE)
        next_runqueue = RunQueueFactory(runnable=next_node, contact_person_id=node.contact_person_id)

        mock_run_queue_dequeue.return_value = next_runqueue

        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL, url_params)

        mock_dequeue_next_run.assert_called_with(node.contact_person_id, 10)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    @patch('eums.api.rapid_pro_hooks.hook._dequeue_next_run')
    def test_should_mark_run_as_complete_when_question_is_a_final_end_node(self,
                                                                           mock_schedule_next_run, *_):
        mock_schedule_next_run.return_value = None
        uuid = '18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c'
        question = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=self.flow)
        self.flow.final_end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        node = DeliveryNodeFactory()
        current_run = RunFactory(runnable=node, phone=self.PHONE)

        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL, url_params)

        run = Run.objects.get(id=current_run.id)
        self.assertEqual(run.status, Run.STATUS.completed)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    @patch('eums.api.rapid_pro_hooks.hook._dequeue_next_run')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_not_mark_run_as_complete_when_question_is_not_end_node(self, mock_run_queue_dequeue,
                                                                           mock_schedule_next_run, *_):
        uuid = '18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c'
        mock_schedule_next_run.return_value = None
        NumericQuestionFactory(text='How much was received?', flow=self.flow, label='amountReceived')

        node = DeliveryNodeFactory()
        original_status = Run.STATUS.scheduled
        run = RunFactory(runnable=node, phone=self.PHONE, status=original_status)
        mock_run_queue_dequeue.return_value = RunQueueFactory(runnable=node, contact_person_id=node.contact_person_id)

        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL, url_params)

        run = Run.objects.get(id=run.id)
        self.assertEqual(run.status, original_status)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_mark_run_returned_by_dequeue_as_started(self, mock_run_queue_dequeue, *_):
        uuid = '18aed9e2-125c-4c6d-a73d-c7ecdb53aa8c'

        question = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=self.flow, )
        self.flow.final_end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        current_node = DeliveryNodeFactory()
        next_node = copy.deepcopy(current_node)

        RunFactory(runnable=current_node, phone=self.PHONE)
        next_run_queue = RunQueueFactory(runnable=next_node, contact_person_id=current_node.contact_person_id)

        mock_run_queue_dequeue.return_value = next_run_queue

        url_params = self._create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL, url_params)

        run_returned_by_dequeue = RunQueue.objects.get(id=next_run_queue.id)

        self.assertEqual(run_returned_by_dequeue.status, RunQueue.STATUS.started)

    @patch('eums.api.rapid_pro_hooks.hook.logger.info')
    @patch('eums.services.response_alert_handler.ResponseAlertHandler.process')
    @patch('eums.api.rapid_pro_hooks.hook._dequeue_next_run')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_call_alert_handler_when_last_question_answered(self, mock_run_queue_dequeue,
                                                                   mock_dequeue_next_run,
                                                                   mock_response_alert_handler_process, *_):
        question = NumericQuestionFactory(text='some text', label='someLabel', flow=self.flow)

        node = DeliveryNodeFactory()
        RunFactory(runnable=node, phone=self.PHONE, status=Run.STATUS.scheduled)

        self.flow.final_end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        url_params = self._create_rapid_pro_url_params(self.PHONE, '1234', '42', None, 'someLabel')
        self.client.post(HOOK_URL, url_params)

        self.assertTrue(mock_response_alert_handler_process.called)

    def _create_rapid_pro_url_params(self, phone, uuid, text="Yes", category=None, label=""):
        return {u'run': [u'4621789'], u'relayer': [u'138'], u'text': [u'%s' % text], u'flow': [u'%s' % self.flow_id],
                u'phone': [u'%s' % phone], u'step': [u'%s' % uuid],
                u'values': [u'[{"category": {"eng": "%s"}, "time": "2014-10-22T11:56:52.836354Z", '
                            u'"text": "Yes", "rule_value": "Yes", "value": "Yes", "label": "%s"}]' % (category, label)],
                u'time': [u'2014-10-22T11:57:35.606372Z']}
