from unittest import TestCase

from eums.models.flow import Flow
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.question_factory import NumericQuestionFactory


class FlowTest(TestCase):
    def test_should_have_all_expected_fields(self):
        flow = Flow()
        fields = [field for field in flow._meta._name_map]

        self.assertEqual(len(fields), 5)
        for field in ['id', 'rapid_pro_id', 'end_nodes', 'questions']:
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
        flow = Flow(end_nodes=[[answer.question.id, Flow.NO_OPTION]])
        self.assertTrue(flow.is_end(answer))

    def test_should_tell_if_numeric_question_ends_the_flow(self):
        answer = NumericAnswerFactory()
        flow = Flow(end_nodes=[[answer.question.id, Flow.NO_OPTION]])
        self.assertTrue(flow.is_end(answer))

    def test_should_know_question_given_uuid(self):
        uuid = ['some uuid']
        flow = FlowFactory()
        question = NumericQuestionFactory(uuids=uuid, flow=flow)

        self.assertEqual(flow.question_with(uuid), question)