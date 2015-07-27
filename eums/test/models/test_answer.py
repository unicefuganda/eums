from unittest import TestCase

from eums.models.answers import TextAnswer, NumericAnswer, MultipleChoiceAnswer


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
    instance = model_instance
    fields_in_item = [field for field in instance._meta._name_map]

    for field in ['question', 'run', 'value']:
        test_case.assertIn(field, fields_in_item)