from unittest import TestCase
from eums.models import Option
from eums.models.question import Question, MultipleChoiceQuestion, TextQuestion


class QuestionTest(TestCase):
    def test_should_have_all_expected_fields(self):
        question = Question()
        fields_in_item = [field.attname for field in question._meta.fields]

        for field in ['text', 'label', 'uuids']:
            self.assertIn(field, fields_in_item)

    def test_should_create_a_default_option_for_multiple_choice_question(self):
        question = MultipleChoiceQuestion.objects.create(text='Whats your gender?', label='gender')
        uncategorised_option = Option.objects.filter(question=question, text=Option.UNCATEGORISED)
        self.assertEqual(uncategorised_option.count(), 1)

    def test_should_not_create_a_default_option_for_non_multiple_choice_question(self):
        question = TextQuestion.objects.create(text='Are you happy?', label="gender")
        uncategorised_option = Option.objects.filter(question=question, text=Option.UNCATEGORISED)
        self.assertEqual(uncategorised_option.count(), 0)

    def test_text_should_be_the_string_representation_of_the_question(self):
        text = 'Whats your gender?'
        question = Question.objects.create(text=text, type=Question.TEXT, label="gender")
        self.assertEqual(str(question), text)

    def tearDown(self):
        TextQuestion.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()