from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import TextAnswerFactory
from eums.test.factories.question_factory import TextQuestionFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory


ENDPOINT_URL = BACKEND_URL + 'text-answers/'


class TextAnswerEndpointTest(AuthenticatedAPITestCase):
    def test_should_get_text_answers(self):
        text_question = TextQuestionFactory(label='dateOfReceipt')
        text_answer = TextAnswerFactory(value="6/10/2014", question=text_question)
        text_answer_details = {
            "id": text_answer.id,
            "value": text_answer.value,
            "question": text_answer.question_id,
            "line_item_run": text_answer.line_item_run_id
        }
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(text_answer_details, response.data[0])

    def test_should_create_text_answers(self):
        text_question = TextQuestionFactory(label='dateOfReceipt')
        line_item_run = NodeLineItemRunFactory()
        text_answer_details = {
            "value": "1",
            "question": text_question.id,
            "line_item_run": line_item_run.id
        }
        response = self.client.post(ENDPOINT_URL, text_answer_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(text_answer_details, response.data)

    def test_should_update_text_answers(self):
        text_question = TextQuestionFactory(label='dateOfReceipt')
        text_answer = TextAnswerFactory(value="6/10/2014", question=text_question)
        updated_text_answer_details = {
            "value": "5/10/2014"
        }
        response = self.client.patch(ENDPOINT_URL+str(text_answer.id)+"/", updated_text_answer_details, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(updated_text_answer_details, response.data)