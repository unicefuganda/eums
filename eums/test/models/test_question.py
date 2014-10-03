from unittest import TestCase
from eums.models.question import Question


class QuestionTest(TestCase):
    def test_should_have_all_expected_fields(self):
        question = Question()
        fields_in_item = [field.attname for field in question._meta.fields]

        for field in ['text', 'uuid', 'type']:
            self.assertIn(field, fields_in_item)
