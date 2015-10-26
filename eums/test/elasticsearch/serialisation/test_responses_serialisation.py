from eums.elasticsearch.serialisers import serialise_nodes
from eums.test.elasticsearch.serialisation.serialisation_test_case import SerialisationTestCase
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.run_factory import RunFactory


class TestResponsesSerialisation(SerialisationTestCase):
    def test_should_serialise_node_response_flat_fields(self):
        node = DeliveryNodeFactory()
        answer = MultipleChoiceAnswerFactory(run=RunFactory(runnable=node))

        expected = {
            "value_id": answer.value.id,
            "run_id": answer.run.id,
            "id": answer.id,
            "value": answer.value.text,
            "question_id": answer.question.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[0]['responses'][0])

    def test_should_serialise_node_response_question(self):
        node = DeliveryNodeFactory()
        question = MultipleChoiceAnswerFactory(run=RunFactory(runnable=node)).question

        expected = {
            "text": question.text,
            "label": question.label,
            "flow_id": question.flow.id,
            "position": question.position,
            "type": question.type,
            "id": question.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[0]['responses'][0]['question'])

    def test_should_serialise_node_response_run(self):
        node = DeliveryNodeFactory()
        run = MultipleChoiceAnswerFactory(run=RunFactory(runnable=node)).run

        expected = {
            "status": run.status,
            "phone": run.phone,
            "id": run.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[0]['responses'][0]['run'])

    def test_responses_serialisation_should_have_an_entry_for_each_response_a_node_has(self):
        node = DeliveryNodeFactory()
        answer_one = MultipleChoiceAnswerFactory(run=RunFactory(runnable=node))
        answer_two = MultipleChoiceAnswerFactory(run=RunFactory(runnable=node))

        serialised = serialise_nodes([node])
        answer_ids = [response['id'] for response in serialised[0]['responses']]
        self.assertItemsEqual(answer_ids, [answer_one.id, answer_two.id])
