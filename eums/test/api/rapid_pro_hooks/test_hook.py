from urllib import quote_plus

from mock import patch
from rest_framework.test import APITestCase

from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.models import MultipleChoiceAnswer, TextAnswer, NumericAnswer, RunQueue, NodeLineItemRun, Flow, \
    MultipleChoiceQuestion, Option, NumericQuestion, TextQuestion
from eums.test.config import BACKEND_URL
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


HOOK_URL = BACKEND_URL + 'hook/'


class HookTest(APITestCase):
    def setUp(self):
        self.PHONE = '+12065551212'
        self.flow_id = 2436
        self.flow = FlowFactory.create(rapid_pro_id=self.flow_id)

    def test_should_record_an_answer_of_type_multiple_choice_for_a_node_from_request_data(self):
        uuid = '2ff9fab3-4c12-400e-a2fe-4551fa1ebc18'

        question, _ = MultipleChoiceQuestion.objects.get_or_create(
            uuids=[uuid], text='Was item received?', label='productReceived'
        )

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        node_line_item_run = NodeLineItemRunFactory(phone=self.PHONE)

        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, 'Yes', 'Yes', 'productReceived')

        response = self.client.post(HOOK_URL + url_params)
        expected_question = MultipleChoiceQuestion.objects.get(uuids=[uuid])
        yes_option = expected_question.option_set.get(text='Yes')

        answers = MultipleChoiceAnswer.objects.filter(question__uuids=[uuid], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, yes_option)

    def test_should_record_an_answer_of_type_multiple_choice_for_a_node__with_multiple_uuids_from_request_data(self):
        uuidS = ['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', 'abc9c005-7a7c-44f8-b946-e970a361b6cf']

        question, _ = MultipleChoiceQuestion.objects.get_or_create(
            uuids=[uuidS], text='Was item received?', label='productReceived'
        )

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        node_line_item_run = NodeLineItemRunFactory(phone=self.PHONE)

        uuid_for_no = uuidS[1]
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid_for_no, 'No', 'No', 'productReceived')

        response = self.client.post(HOOK_URL + url_params)
        expected_question = MultipleChoiceQuestion.objects.get(uuids=[uuidS])
        no_option = expected_question.option_set.get(text='No')

        answers = MultipleChoiceAnswer.objects.filter(question__uuids=[uuidS], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, no_option)

    def test_should_record_an_answer_of_type_text_for_a_node_from_request_data(self):
        uuid = 'abc9c005-7a7c-44f8-b946-e970a361b6cf'

        TextQuestion.objects.get_or_create(uuids=[uuid], text='What date was it received?', label='dateOfReceipt')

        node_line_item_run = NodeLineItemRunFactory(phone=('%s' % self.PHONE))
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, 'Some Text', None, 'dateOfReceipt')

        response = self.client.post(HOOK_URL + url_params)

        answers = TextAnswer.objects.filter(question__uuids=[uuid], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, 'Some Text')

    def test_should_record_an_answer_of_type_numeric_for_a_node_from_request_data(self):
        uuid = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        NumericQuestion.objects.get_or_create(uuids=[uuid], text='How much was received?', label='amountReceived')

        node_line_item_run = NodeLineItemRunFactory(phone=('%s' % self.PHONE))
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, 42, None, 'amountReceived')

        response = self.client.post(HOOK_URL + url_params)

        answers = NumericAnswer.objects.filter(question__uuids=[uuid], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, 42)

    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_dequeue_current_line_item_when_question_is_final(self, mock_run_queue_dequeue,
                                                                     mock_flow_scheduler_schedule_run_for):
        uuid = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        question, _ = NumericQuestion.objects.get_or_create(uuids=[uuid], text='How much was received?',
                                                            label='amountReceived')

        node_line_item = DistributionPlanLineItemFactory()

        NodeLineItemRunFactory(node_line_item=node_line_item, phone=self.PHONE)

        mock_run_queue_dequeue.return_value = RunQueueFactory(
            node_line_item=node_line_item,
            contact_person_id=node_line_item.distribution_plan_node.contact_person_id)

        self.flow.end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL + url_params)

        mock_flow_scheduler_schedule_run_for.assert_called_with(node_line_item)

    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_mark_line_item_run_as_complete_when_question_is_final(self, mock_run_queue_dequeue, _):
        uuid = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        question, _ = NumericQuestion.objects.get_or_create(uuids=[uuid], text='How much was received?',
                                                            label='amountReceived')

        node_line_item = DistributionPlanLineItemFactory()
        node_line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, phone=self.PHONE,
                                                    status=NodeLineItemRun.STATUS.scheduled)

        mock_run_queue_dequeue.return_value = RunQueueFactory(
            node_line_item=node_line_item,
            contact_person_id=node_line_item.distribution_plan_node.contact_person_id)

        self.flow.end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL + url_params)

        node_line_item_run = NodeLineItemRun.objects.get(id=node_line_item_run.id)
        self.assertEqual(node_line_item_run.status, NodeLineItemRun.STATUS.completed)

    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_not_mark_line_item_run_as_complete_when_question_is_not_final(self, mock_run_queue_dequeue, _):
        uuid = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        NumericQuestion.objects.get_or_create(uuids=[uuid], text='How much was received?', label='amountReceived')

        node_line_item = DistributionPlanLineItemFactory()
        original_status = NodeLineItemRun.STATUS.scheduled
        node_line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item, phone=self.PHONE,
                                                    status=original_status)

        mock_run_queue_dequeue.return_value = RunQueueFactory(
            node_line_item=node_line_item,
            contact_person_id=node_line_item.distribution_plan_node.contact_person_id)

        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')
        self.client.post(HOOK_URL + url_params)

        node_line_item_run = NodeLineItemRun.objects.get(id=node_line_item_run.id)
        self.assertEqual(node_line_item_run.status, original_status)

    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.RunQueue.dequeue')
    def test_should_mark_run_returned_by_dequeue_as_started(self, mock_run_queue_dequeue, _):
        uuid = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        question, _ = NumericQuestion.objects.get_or_create(uuids=[uuid], text='How much was received?',
                                                            label='amountReceived')

        node_line_item = DistributionPlanLineItemFactory()
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid, '42', None, 'amountReceived')

        NodeLineItemRunFactory(node_line_item=node_line_item, phone=self.PHONE)

        next_run = RunQueueFactory(node_line_item=node_line_item,
                                   contact_person_id=node_line_item.distribution_plan_node.contact_person_id)
        mock_run_queue_dequeue.return_value = next_run

        self.flow.end_nodes = [[question.id, Flow.NO_OPTION]]
        self.flow.save()

        self.client.post(HOOK_URL + url_params)

        run_returned_by_dequeue = RunQueue.objects.get(id=next_run.id)

        self.assertEqual(run_returned_by_dequeue.status, RunQueue.STATUS.started)

    def __create_rapid_pro_url_params(self, phone, uuid, text="Yes", category=None, label=""):
        unencoded_url = 'run=4621789&phone=%s&text=%s&flow=%s&relayer=-1&step=%s&values=[{"category": "%s", "time": "2014-10-06T08:17:11.813785Z", "text": "Yes", "rule_value": "Yes", "value": "Yes", "label": "%s"}]&time=2014-10-06T08:17:16.214821Z&steps=[{"node": "9f946daf-91aa-4ed2-8679-4529eb6a9938", "arrived_on": "2014-10-06T08:17:11.806305Z", "left_on": "2014-10-06T08:17:11.812105Z", "text": "Hi @extra.contactName, @extra.sender, has sent @extra.product to you provided by UNICEF. Have you received it? Please reply YES or NO.", "type": "A", "value": null}, {"node": "23ac84cf-cd9c-4d10-a365-0c7e2e57b019", "arrived_on": "2014-10-06T08:17:11.813785Z", "left_on": null, "text": "Yes", "type": "R", "value": "Yes"}]' % (
            phone, text, self.flow_id, uuid, category, label)
        return '?' + quote_plus(unencoded_url, '=&')