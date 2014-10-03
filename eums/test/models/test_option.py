from unittest import TestCase
from eums.models import Option


class OptionTest(TestCase):
    def test_should_have_all_expected_fields(self):
        option = Option()
        fields_in_option = [field for field in option._meta._name_map]

        for field in ['text', 'question']:
            self.assertIn(field, fields_in_option)

    def test_no_two_options_should_have_the_same_question_and_text(self):
        option = Option()
        self.assertEqual(option._meta.unique_together, (('text', 'question'),))

