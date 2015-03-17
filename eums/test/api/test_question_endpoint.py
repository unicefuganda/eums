from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.question_factory import TextQuestionFactory
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'question/'


class QuestionEndpointTest(AuthenticatedAPITestCase):
    def expected_response_data(self, question):
        expected_data = {
            "id": question.id,
            "text": question.text,
            "label": question.label
        }
        return expected_data

    def test_should_get_question(self):
        text_question = TextQuestionFactory()
        expected_data = self.expected_response_data(text_question)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(expected_data, get_response.data[0])

    def test_should_get_questions_sorted_by_text(self):
        text_question_one = TextQuestionFactory(text='B')
        text_question_two = TextQuestionFactory(text='A')
        expected_data_one = self.expected_response_data(text_question_one)
        expected_data_two = self.expected_response_data(text_question_two)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(expected_data_two, get_response.data[0])
        self.assertDictContainsSubset(expected_data_one, get_response.data[1])

    def test_should_search_for_question_by_label(self):
        text_question_one = TextQuestionFactory(label='productReceived')
        text_question_two = TextQuestionFactory(label='satisfied')
        expected_data_one = self.expected_response_data(text_question_one)
        expected_data_two = self.expected_response_data(text_question_two)

        get_response = self.client.get(ENDPOINT_URL + '?search=productReceived')

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(expected_data_one, get_response.data[0])
        self.assertNotIn(expected_data_two, get_response.data)