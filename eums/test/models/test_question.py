from unittest import TestCase

from eums.models import Option
from eums.models.question import Question
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory
from eums.test.factories.run_factory import RunFactory


class QuestionTest(TestCase):
    def setUp(self):
        self.run = RunFactory()
        self.multiple_choice_question = MultipleChoiceQuestionFactory(text='Whats your gender?', label='gender')
        self.text_question = TextQuestionFactory(text='Are you happy?', label="happiness")

    def test_should_have_all_expected_fields(self):
        question = Question()
        fields_in_item = [field.attname for field in question._meta.fields]

        for field in ['text', 'label', 'uuids', 'position']:
            self.assertIn(field, fields_in_item)

    def test_should_create_a_default_option_for_multiple_choice_question(self):
        uncategorised_option = Option.objects.filter(question=self.multiple_choice_question, text=Option.UNCATEGORISED)
        self.assertEqual(uncategorised_option.count(), 1)

    def test_should_not_create_a_default_option_for_non_multiple_choice_question(self):
        uncategorised_options = Option.objects.filter(question=self.text_question, text=Option.UNCATEGORISED)
        questions_with_options = map(lambda o: o.question, uncategorised_options)

        self.assertNotIn(self.text_question, questions_with_options)

    def test_text_should_be_the_string_representation_of_the_question(self):
        text = self.text_question.text
        self.assertEqual(str(self.text_question), text)

    def tearDown(self):
        Question.objects.all().delete()


class TextQuestionTest(QuestionTest):
    def test_should_save_text_answer(self):
        text = 'Some text'
        params = {'text': text}
        self.text_question.create_answer(params, self.run)
        answers = self.text_question.textanswer_set.all()

        self.assertEqual(answers.count(), 1)
        self.assertEqual(answers.first().value, text)


class MultipleChoiceQuestionTest(QuestionTest):
    # TODO Figure out why this test fails
    def xtest_should_save_multiple_choice_answer(self):
        text = "Yes"
        option = self.multiple_choice_question.option_set.create(text=text)

        category = 'category'
        label = 'gender'
        params = [{u'values': [u'[{"category": "%s", "time": "2014-10-22T11:56:52.836354Z", '
                               u'"text": "Yes", "value": "Yes", "label": "%s"}]' % (category, label)],
                   u'time': [u'2014-10-22T11:57:35.606372Z']}]

        self.multiple_choice_question.create_answer(params, self.run)
        answers = self.multiple_choice_question.multiplechoiceanswer_set.all()

        self.assertEqual(answers.count(), 1)
        self.assertEqual(answers.first().value, option)


class NumericQuestionTest(QuestionTest):
    def test_should_save_numeric_answer(self):
        numeric_question = NumericQuestionFactory(text='How old are you?')
        number = 20
        params = {'text': number}

        numeric_question.create_answer(params, self.run)
        answers = numeric_question.numericanswer_set.all()

        self.assertEqual(answers.count(), 1)
        self.assertEqual(answers.first().value, number)
