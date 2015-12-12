from django.utils import timezone
from eums.elasticsearch.serialisers import serialise_nodes
from eums.models import DistributionPlanNode as DeliveryNode, Flow, Runnable, TextQuestion
from eums.test.elasticsearch.serialisation.serialisation_test_case import SerialisationTestCase
from eums.test.factories.answer_factory import TextAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.run_factory import RunFactory


class TestDeliveryDatesSerialisation(SerialisationTestCase):
    def test_should_add_response_to_when_shipment_was_received_question_for_ip_nodes_to_responses_list(self):
        date_received = timezone.datetime(2015, 1, 10).date()
        delivery = DeliveryFactory()
        ip_flow = Flow.objects.get(label=Flow.Label.IMPLEMENTING_PARTNER)
        qn_date_of_receipt = TextQuestion.objects.get(flow=ip_flow, label='dateOfReceipt')
        answer = TextAnswerFactory(run=RunFactory(runnable=delivery), question=qn_date_of_receipt, value=date_received)
        node = DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, distribution_plan=delivery,
                                   delivery_date=date_received)

        expected = {
            "run_id": answer.run.id,
            "id": answer.id,
            "value": str(answer.value),
            "question_id": answer.question.id
        }

        serialised = serialise_nodes([node])
        self.assertDictContainsSubset(expected, serialised[0]['responses'][0])
