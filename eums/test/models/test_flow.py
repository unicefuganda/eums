from unittest import TestCase

from eums.models.flow import Flow
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory


class FlowTest(TestCase):
    def test_should_have_all_expected_fields(self):
        flow = Flow()
        fields = [field for field in flow._meta._name_map]

        self.assertEqual(len(fields), 5)
        for field in ['id', 'rapid_pro_id', 'questions', 'end_nodes']:
            self.assertIn(field, fields)

    def test_should_tell_if_question_answer_combination_ends_the_flow(self):
        answer_1 = MultipleChoiceAnswerFactory()
        answer_2 = MultipleChoiceAnswerFactory()
        flow = Flow(end_nodes=[
            [answer_1.question.id, answer_1.value.id],
            [answer_2.question.id, answer_2.value.id]
        ])
        self.assertTrue(flow.is_end(answer_1))
        self.assertTrue(flow.is_end(answer_2))

    def test_should_tell_if_question_answer_combination_does_not_end_the_flow(self):
        answer = MultipleChoiceAnswerFactory()
        flow = Flow()
        self.assertFalse(flow.is_end(answer))

    def test_should_tell_if_text_question_ends_the_flow(self):
        answer = TextAnswerFactory()
        flow = Flow(end_nodes=[[answer.question.id, None]])
        self.assertTrue(flow.is_end(answer))

    def test_should_tell_if_numeric_question_ends_the_flow(self):
        answer = NumericAnswerFactory()
        flow = Flow(end_nodes=[[answer.question.id, None]])
        self.assertTrue(flow.is_end(answer))