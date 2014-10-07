from urllib import quote_plus

from rest_framework.test import APITestCase
from eums.fixtures.questions import *
from eums.models import MultipleChoiceAnswer, TextAnswer, NumericAnswer
from eums.test.config import BACKEND_URL
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


HOOK_URL = BACKEND_URL + 'hook/'


class HookTest(APITestCase):
    def setUp(self):
        self.PHONE = '+12065551212'

    def test_should_record_an_answer_of_type_multiple_choice_for_a_node_from_request_data(self):
        UUID = '2ff9fab3-4c12-400e-a2fe-4551fa1ebc18'

        question, _ = MultipleChoiceQuestion.objects.get_or_create(
            uuids=[UUID], text='Was item received?', label='productReceived'
        )

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        node_line_item_run = NodeLineItemRunFactory(phone=self.PHONE)

        url_params = self.__create_rapid_pro_url_params(self.PHONE, UUID, 'Yes', 'Yes', 'productReceived')

        response = self.client.post(HOOK_URL + url_params)
        expected_question = MultipleChoiceQuestion.objects.get(uuids=[UUID])
        yes_option = expected_question.option_set.get(text='Yes')

        answers = MultipleChoiceAnswer.objects.filter(question__uuids=[UUID], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, yes_option)

    def test_should_record_an_answer_of_type_multiple_choice_for_a_node__with_multiple_uuids_from_request_data(self):
        UUIDS = ['2ff9fab3-4c12-400e-a2fe-4551fa1ebc18', 'abc9c005-7a7c-44f8-b946-e970a361b6cf']

        question, _ = MultipleChoiceQuestion.objects.get_or_create(
            uuids=[UUIDS], text='Was item received?', label='productReceived'
        )

        Option.objects.get_or_create(text='Yes', question=question)
        Option.objects.get_or_create(text='No', question=question)

        node_line_item_run = NodeLineItemRunFactory(phone=self.PHONE)

        uuid_for_no = UUIDS[1]
        url_params = self.__create_rapid_pro_url_params(self.PHONE, uuid_for_no, 'No', 'No', 'productReceived')

        response = self.client.post(HOOK_URL + url_params)
        expected_question = MultipleChoiceQuestion.objects.get(uuids=[UUIDS])
        no_option = expected_question.option_set.get(text='No')

        answers = MultipleChoiceAnswer.objects.filter(question__uuids=[UUIDS], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, no_option)

    def test_should_record_an_answer_of_type_text_for_a_node_from_request_data(self):
        UUID = 'abc9c005-7a7c-44f8-b946-e970a361b6cf'

        TextQuestion.objects.get_or_create(uuids=[UUID], text='What date was it received?', label='dateOfReceipt')

        node_line_item_run = NodeLineItemRunFactory(phone=('%s' % self.PHONE))
        url_params = self.__create_rapid_pro_url_params(self.PHONE, UUID, 'Some Text', None, 'dateOfReceipt')

        response = self.client.post(HOOK_URL + url_params)

        answers = TextAnswer.objects.filter(question__uuids=[UUID], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, 'Some Text')

    def test_should_record_an_answer_of_type_numeric_for_a_node_from_request_data(self):
        UUID = '6c1cf92d-59b8-4bd3-815b-783abd3dfad9'

        NumericQuestion.objects.get_or_create(uuids=[UUID], text='How much was received?', label='amountReceived')

        node_line_item_run = NodeLineItemRunFactory(phone=('%s' % self.PHONE))
        url_params = self.__create_rapid_pro_url_params(self.PHONE, UUID, 42, None, 'amountReceived')

        response = self.client.post(HOOK_URL + url_params)

        answers = NumericAnswer.objects.filter(question__uuids=[UUID], line_item_run=node_line_item_run)
        created_answer = answers.first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, 42)

    def __create_rapid_pro_url_params(self, phone, uuid, text="Yes", category=None, label=""):
        unencoded_url = 'run=4621789&phone=%s&text=%s&flow=2436&relayer=-1&step=%s&values=[{"category": "%s", "time": "2014-10-06T08:17:11.813785Z", "text": "Yes", "rule_value": "Yes", "value": "Yes", "label": "%s"}]&time=2014-10-06T08:17:16.214821Z&steps=[{"node": "9f946daf-91aa-4ed2-8679-4529eb6a9938", "arrived_on": "2014-10-06T08:17:11.806305Z", "left_on": "2014-10-06T08:17:11.812105Z", "text": "Hi @extra.contactName, @extra.sender, has sent @extra.product to you provided by UNICEF. Have you received it? Please reply YES or NO.", "type": "A", "value": null}, {"node": "23ac84cf-cd9c-4d10-a365-0c7e2e57b019", "arrived_on": "2014-10-06T08:17:11.813785Z", "left_on": null, "text": "Yes", "type": "R", "value": "Yes"}]' % (
            phone, text, uuid, category, label)
        return '?' + quote_plus(unencoded_url, '=&')