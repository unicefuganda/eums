from unittest import TestCase
from eums.models import Option


class OptionTest(TestCase):
    def test_no_two_options_should_have_the_same_question_and_text(self):
        option = Option()
        self.assertEqual(option._meta.unique_together, (('text', 'question'),))

