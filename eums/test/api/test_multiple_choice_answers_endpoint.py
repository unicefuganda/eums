from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'multiple-choice-answers/'


class MultipleChoiceAnswerEndpointTest(AuthenticatedAPITestCase):
    def test_should_get_multiple_choice_answers(self):
        multiple_choice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = multiple_choice_question.option_set.first()
        multiple_choice_answer = MultipleChoiceAnswerFactory(value=yes_option, question=multiple_choice_question)
        multiple_choice_answer_details = {
            "id": multiple_choice_answer.id,
            "value": multiple_choice_answer.value.id,
            "question": multiple_choice_answer.question_id,
            "run": multiple_choice_answer.run_id
        }
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(multiple_choice_answer_details, response.data[0])

    def test_should_create_multiple_choice_answers(self):
        multiple_choice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = multiple_choice_question.option_set.first()
        run = RunFactory()
        multiple_choice_answer_details = {
            "value": yes_option.id,
            "question": multiple_choice_question.id,
            "run": run.id
        }
        response = self.client.post(ENDPOINT_URL, multiple_choice_answer_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(multiple_choice_answer_details, response.data)

    def test_should_update_multiple_choice_answers(self):
        multiple_choice_question = MultipleChoiceQuestionFactory(label='amountReceived')
        yes_option = multiple_choice_question.option_set.first()
        no_option = multiple_choice_question.option_set.last()
        multiple_choice_answer = MultipleChoiceAnswerFactory(value=yes_option, question=multiple_choice_question)
        updated_multiple_choice_answer_details = {
            "value": no_option.id
        }
        response = self.client.patch(ENDPOINT_URL+str(multiple_choice_answer.id)+"/", updated_multiple_choice_answer_details, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(updated_multiple_choice_answer_details, response.data)