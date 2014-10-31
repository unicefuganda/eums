from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import TextAnswerFactory
from eums.test.factories.question_factory import TextQuestionFactory


ENDPOINT_URL = BACKEND_URL + 'date-answers/'


class DateAnswerEndpointTest(AuthenticatedAPITestCase):
    def test_should_get_date_answers(self):
        date_question = TextQuestionFactory(label='dateOfReceipt')
        date_answer = TextAnswerFactory(value="6/10/2014", question=date_question)
        date_answer_details = {
            "value": date_answer.value,
            "question": date_answer.question_id
        }
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(date_answer_details, response.data[0])