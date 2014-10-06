from rest_framework.test import APITestCase

from eums.fixtures.questions import *

from eums.models import MultipleChoiceAnswer

from eums.test.config import BACKEND_URL
from eums.test.factories.node_run_factory import NodeRunFactory


HOOK_URL = BACKEND_URL + 'hook/'


class HookTest(APITestCase):
    def xtest_should_record_an_answer_of_type_multi_choice_for_a_node_from_request_data(self):

        seed_questions()

        node_run = NodeRunFactory()
        url_params = '?run=4621789&phone=%2B12065551212&text=Yes&flow=2436&relayer=-1&' \
                     'step=2ff9fab3-4c12-400e-a2fe-4551fa1ebc18&' \
                     'values=%5B%7B%22category%22%3A+%22Yes%22%2C+%22time%22%3A+%222014-10-06T08%3A17%' \
                     '3A11.813785Z%22%2C+%22text%22%3A+%22Yes%22%2C+%22rule_value%22%3A+%22Yes%22%2C+' \
                     '%22value%22%3A+%22Yes%22%2C+%22label%22%3A+%22productReceived%22%7D%5D&' \
                     'time=2014-10-06T08%3A17%3A16.214821Z&steps=%5B%7B%22node%22%3A+%' \
                     '229f946daf-91aa-4ed2-8679-4529eb6a9938%22%2C+%22arrived_on' \
                     '%22%3A+%222014-10-06T08%3A17%3A11.806305Z%22%2C+%22left_on%22%3A+%222014-10-06T08%3A17%' \
                     '3A11.812105Z%22%2C+%22text%22%3A+%22Hi+%40extra.contactName%2C+%40extra.sender%2C+has+sent+%' \
                     '40extra.product+to+you+provided+by+UNICEF.+Have+you+received+it%3F+Please+reply+YES+or+NO.%22%' \
                     '2C+%22type%22%3A+%22A%22%2C+%22value%22%3A+null%7D%2C+%7B%22node%22%3A+%' \
                     '2223ac84cf-cd9c-4d10-a365-0c7e2e57b019%22%2C+%22arrived_on%22%3A+%222014-10-06T08%3A17%' \
                     '3A11.813785Z%22%2C+%22left_on%22%3A+null%2C+%22text%22%3A+%22Yes%22%2C+%22type%22%3A+%22R%22%2C' \
                     '+%22value%22%3A+%22Yes%22%7D%5D'

        response = self.client.post(HOOK_URL + url_params)
        uuid = '2ff9fab3-4c12-400e-a2fe-4551fa1ebc18'
        expected_question = Question.objects.get(uuids=uuid)
        yes_option = expected_question.option_set.get(text='Yes')

        created_answer = MultipleChoiceAnswer.objects.filter(question__uuids=uuid, node_run=node_run).first()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(created_answer.value, yes_option)