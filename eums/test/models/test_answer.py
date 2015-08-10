from unittest import TestCase

from mock import patch

from eums.models.answers import TextAnswer, NumericAnswer, MultipleChoiceAnswer
from eums.test.factories.answer_factory import TextAnswerFactory, MultipleChoiceAnswerFactory
from eums.test.factories.question_factory import TextQuestionFactory, MultipleChoiceQuestionFactory


class AnswerTest(TestCase):
    @patch('eums.models.question_hooks.update_consignee_stock_level')
    def test_should_call_post_create_answer_hook_on_save_if_question_specifies_a_hook(self, mock_post_create_hook):
        question = TextQuestionFactory(when_answered='update_consignee_stock_level')
        answer = TextAnswerFactory(question=question)
        mock_post_create_hook.assert_called_with(answer)

    @patch('eums.models.question_hooks.update_consignee_stock_level')
    def test_should_not_call_post_create_answer_hook_for_questions_that_have_none(self, mock_post_create_hook):
        question = TextQuestionFactory()
        TextAnswerFactory(question=question)
        self.assertEqual(mock_post_create_hook.call_count, 0)

    @patch('eums.models.question_hooks.update_consignee_stock_level')
    def test_should_roll_back_hook_effect_when_answer_is_deleted(self, mock_post_create_hook):
        question = TextQuestionFactory(when_answered='update_consignee_stock_level')
        answer = TextAnswerFactory(question=question)
        mock_post_create_hook.reset_mock()
        answer.delete()
        mock_post_create_hook.assert_called_with(answer, rollback=True)

    @patch('eums.models.question_hooks.update_consignee_stock_level')
    def test_should_call_post_create_answer_hook_for_multiple_choice_question(self, mock_post_create_hook):
        question = MultipleChoiceQuestionFactory(when_answered='update_consignee_stock_level')
        answer = MultipleChoiceAnswerFactory(question=question)
        mock_post_create_hook.assert_called_with(answer)


class TextAnswerTest(TestCase):
    def test_should_have_all_expected_fields(self):
        test_expected_fields_exist(self, TextAnswer())


class NumericAnswerTest(TestCase):
    def test_should_have_all_expected_fields(self):
        test_expected_fields_exist(self, NumericAnswer())


class MultipleChoiceAnswerTest(TestCase):
    def test_should_have_all_expected_fields(self):
        test_expected_fields_exist(self, MultipleChoiceAnswer())


def test_expected_fields_exist(test_case, model_instance):
    fields_in_item = [field for field in model_instance._meta._name_map]

    for field in ['question', 'run', 'value']:
        test_case.assertIn(field, fields_in_item)
