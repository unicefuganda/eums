from unittest import TestCase
from eums.models.flow import Flow


class FlowTest(TestCase):
    def test_should_have_all_expected_fields(self):
        instance = Flow()
        fields = [field for field in instance._meta._name_map]

        self.assertEqual(len(fields), 5)
        for field in ['id', 'rapid_pro_id', 'questions', 'end_questions']:
            self.assertIn(field, fields)