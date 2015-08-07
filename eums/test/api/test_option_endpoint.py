from eums.test.api.api_test_helpers import create_option
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.models.question import MultipleChoiceQuestion

ENDPOINT_URL = BACKEND_URL + 'option/'
RECEIVED_OPTIONS_ENDPOINT_URL = BACKEND_URL + 'received-options/'
QUALITY_OPTIONS_ENDPOINT_URL = BACKEND_URL + 'quality-options/'
SATISFIED_OPTIONS_ENDPOINT_URL = BACKEND_URL + 'satisfied-options/'


class OptionsEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_item(self):
        question = MultipleChoiceQuestionFactory()
        option_details = {'text': "Bad", 'question': question.id}

        response = self.client.post(ENDPOINT_URL, option_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(option_details, response.data)

    def test_should_get_options_sorted_by_text(self):
        question = MultipleChoiceQuestionFactory()
        option_one_details = {'text': "B Option", 'question': question.id}
        option_two_details = {'text': "A Option", 'question': question.id}

        create_option(self, option_one_details)
        create_option(self, option_two_details)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(option_two_details, get_response.data[0])
        self.assertDictContainsSubset(option_one_details, get_response.data[1])


class ReceivedOptionsEndPointTest(AuthenticatedAPITestCase):
    def test_should_only_get_received_options(self):
        received_question = MultipleChoiceQuestionFactory(
            uuids=['6c1cf97d-59b8-4bd3-815b-783abd3dfad9'],
            text='Was product received?', label='productReceived'
        )
        other_question = MultipleChoiceQuestionFactory()

        option_one_details = {'text': "Yes", 'question': received_question.id}
        option_two_details = {'text': "No", 'question': received_question.id}
        option_three_details = {'text': "Other", 'question': other_question.id}

        create_option(self, option_one_details)
        create_option(self, option_two_details)
        create_option(self, option_three_details)

        get_response = self.client.get(RECEIVED_OPTIONS_ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(option_one_details, get_response.data[0])
        self.assertDictContainsSubset(option_two_details, get_response.data[2])
        self.assertNotIn(option_three_details, get_response.data)


class QualityOptionsEndPointTest(AuthenticatedAPITestCase):
    def test_should_only_get_quality_options_sorted_by_text(self):
        quality_question = MultipleChoiceQuestionFactory(
            uuids=['6c1cf92d-59b8-4bd3-815b-783abd3dfad9'],
            text='What is the quality of the product?', label='qualityOfProduct'
        )
        other_question = MultipleChoiceQuestionFactory()

        option_one_details = {'text': "B Option", 'question': quality_question.id}
        option_two_details = {'text': "A Option", 'question': quality_question.id}
        option_three_details = {'text': "C Option", 'question': other_question.id}

        create_option(self, option_one_details)
        create_option(self, option_two_details)
        create_option(self, option_three_details)

        get_response = self.client.get(QUALITY_OPTIONS_ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(option_two_details, get_response.data[0])
        self.assertDictContainsSubset(option_one_details, get_response.data[1])
        self.assertNotIn(option_three_details, get_response.data)


class SatisfiedOptionsEndPointTest(AuthenticatedAPITestCase):
    def test_should_only_get_satisfied_options(self):
        satisfied_question = MultipleChoiceQuestionFactory(
            uuids=['6c1cf27d-59b8-4bd3-815b-783abd3dfad9'],
            text='Are you satisfied with the product?', label='satisfiedWithProduct'
        )
        other_question = MultipleChoiceQuestionFactory()

        option_one_details = {'text': "Yes", 'question': satisfied_question.id}
        option_two_details = {'text': "No", 'question': satisfied_question.id}
        option_three_details = {'text': "Other", 'question': other_question.id}

        create_option(self, option_one_details)
        create_option(self, option_two_details)
        create_option(self, option_three_details)

        get_response = self.client.get(SATISFIED_OPTIONS_ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(option_one_details, get_response.data[0])
        self.assertDictContainsSubset(option_two_details, get_response.data[2])
        self.assertNotIn(option_three_details, get_response.data)
