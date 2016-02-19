from rest_framework import status
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import NumericAnswerFactory
from eums.test.factories.question_factory import NumericQuestionFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'numeric-answers/'


class NumericAnswerEndpointTest(AuthenticatedAPITestCase):
    def prepare_test_data(self):
        numeric_question = NumericQuestionFactory(label='dateOfReceipt')
        run = RunFactory()
        return numeric_question, run

    def test_should_get_Numeric_answers(self):
        numeric_question = NumericQuestionFactory(label='amountReceived')
        numeric_answer = NumericAnswerFactory(value=1, question=numeric_question)
        numeric_answer_details = {
            "id": numeric_answer.id,
            "value": numeric_answer.value,
            "question": numeric_answer.question_id,
            "run": numeric_answer.run_id
        }
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(numeric_answer_details, response.data[0])

    def test_should_create_numeric_answers(self):
        numeric_question, run = self.prepare_test_data()
        numeric_answer_details = {
            "value": 1,
            "question": numeric_question.id,
            "run": run.id,
            "remark": "Some remark"
        }
        response = self.client.post(ENDPOINT_URL, numeric_answer_details, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertDictContainsSubset(numeric_answer_details, response.data)

    def test_should_success_when_create_numeric_answers_with_value_0(self):
        numeric_question, run = self.prepare_test_data()
        numeric_answer_details = {
            "value": 0,
            "question": numeric_question.id,
            "run": run.id,
            "remark": ""
        }
        response = self.client.post(ENDPOINT_URL, numeric_answer_details, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertDictContainsSubset(numeric_answer_details, response.data)

    def test_should_failed_when_create_numeric_answers_with_value_none(self):
        numeric_question, run = self.prepare_test_data()
        numeric_answer_details = {
            "value": None,
            "question": numeric_question.id,
            "run": run.id,
            "remark": ""
        }
        response = self.client.post(ENDPOINT_URL, numeric_answer_details, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_should_success_when_create_numeric_answers_with_remark_empty(self):
        numeric_question, run = self.prepare_test_data()
        numeric_answer_details = {
            "value": 1,
            "question": numeric_question.id,
            "run": run.id,
            "remark": None
        }
        response = self.client.post(ENDPOINT_URL, numeric_answer_details, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertDictContainsSubset(numeric_answer_details, response.data)

    def test_should_update_numeric_answers(self):
        updated_numeric_answer = {"value": 2, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_admin_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictContainsSubset(updated_numeric_answer, response.data)

    def test_should_success_when_update_numeric_answers_with_value_0(self):
        updated_numeric_answer = {"value": 0, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_admin_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictContainsSubset(updated_numeric_answer, response.data)

    def test_should_failed_when_update_numeric_answers_with_value_none(self):
        updated_numeric_answer = {"value": None, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_admin_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_should_failed_when_update_numeric_answers_with_remark_empty(self):
        updated_numeric_answer = {"value": 2, "remark": ""}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_admin_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unicef_editor_should_have_permission_to_update_numeric_answer(self):
        updated_numeric_answer = {"value": 2, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_editor_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unicef_viewer_should_not_have_permission_to_update_numeric_answer(self):
        updated_numeric_answer = {"value": 2, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_unicef_viewer_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ip_editor_should_not_have_permission_to_update_numeric_answer(self):
        updated_numeric_answer = {"value": 2, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_ip_editor_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ip_viewer_should_not_have_permission_to_update_numeric_answer(self):
        updated_numeric_answer = {"value": 2, "remark": "Some remark"}
        response = self.__login_and_update_existing_numeric_answer(self.log_ip_viewer_in, updated_numeric_answer)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def __login_and_update_existing_numeric_answer(self, login_func, updated_numeric_answer):
        login_func()
        numeric_question = NumericQuestionFactory(label='amountReceived')
        numeric_answer = NumericAnswerFactory(value=1, question=numeric_question)
        return self.client.patch(ENDPOINT_URL + str(numeric_answer.id) + "/", updated_numeric_answer, format='json')
