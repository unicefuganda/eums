from eums.models import MultipleChoiceQuestion, TextQuestion, NumericAnswer, Flow, Runnable, NumericQuestion, TextAnswer, \
    MultipleChoiceAnswer, Option, Run, DistributionPlan, DistributionPlanNode, Consignee, Programme, PurchaseOrderItem, \
    ReleaseOrderItem, PurchaseOrder, SalesOrder, Item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'ip-feedback-report/'


class IpFeedbackReportEndPointTest(AuthenticatedAPITestCase):

    def tearDown(self):
        MultipleChoiceQuestion.objects.all().delete()
        TextQuestion.objects.all().delete()
        NumericQuestion.objects.all().delete()
        Option.objects.all().delete()

        MultipleChoiceAnswer.objects.all().delete()
        NumericAnswer.objects.all().delete()
        TextAnswer.objects.all().delete()
        Flow.objects.all().delete()
        Run.objects.all().delete()
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()
        Consignee.objects.all().delete()
        Programme.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        ReleaseOrderItem.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        SalesOrder.objects.all().delete()
        Item.objects.all().delete()

    def test_returns_401_unless_admin(self):
        consignee = ConsigneeFactory()
        self.logout()
        self.log_consignee_in(consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 401)

    def test_returns_200_when_admin(self):
        self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

    def test_should_return_reports_for_tracked_items_only(self):
        self.setup_nodes_with_answers(track_delivery_one=False)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(len(response.data), 1)

    def test_should_return_items_and_all_their_answers(self):
        delivery_one, node_one, purchase_order_item = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        self.assertEqual(len(response.data), 2)
        self.assertDictContainsSubset({'item_description': purchase_order_item.item.description}, response.data[0])
        self.assertDictContainsSubset({'programme': delivery_one.programme.name}, response.data[0])
        self.assertDictContainsSubset({'consignee': node_one.consignee.name}, response.data[0])
        self.assertDictContainsSubset({'order_number': purchase_order_item.purchase_order.order_number}, response.data[0])
        self.assertDictContainsSubset({'quantity_shipped': node_one.quantity_out()}, response.data[0])
        self.assertEqual(len(response.data[0]['answers']), 5)

    def setup_nodes_with_answers(self, track_delivery_one=True, track_delivery_two=True):
        consignee = ConsigneeFactory()
        programme = ProgrammeFactory()
        purchase_order_item = PurchaseOrderItemFactory()
        release_order_item = ReleaseOrderItemFactory()
        delivery_one = DeliveryFactory(programme=programme, track=track_delivery_one)
        delivery_two = DeliveryFactory(programme=programme, track=track_delivery_two)
        node_one = DeliveryNodeFactory(distribution_plan=delivery_one, consignee=consignee, item=purchase_order_item)
        node_two = DeliveryNodeFactory(distribution_plan=delivery_two, consignee=consignee, item=release_order_item)
        flow = FlowFactory(for_runnable_type='WEB')
        question_1 = MultipleChoiceQuestionFactory(text='Was the item received?', label='itemReceived', flow=flow,
                                                   position=1)
        option_1 = OptionFactory(text='Yes', question=question_1)
        question_2 = NumericQuestionFactory(text='How much was received?', label='amountReceived', flow=flow)
        question_3 = MultipleChoiceQuestionFactory(text='What is the quality of the product?', label='qualityOfProduct',
                                                   flow=flow, position=3)
        option_3 = OptionFactory(text='Damaged', question=question_3)
        question_4 = MultipleChoiceQuestionFactory(text='Are you satisfied with the product?',
                                                   label='satisfiedWithProduct', flow=flow, position=4)
        option_4 = OptionFactory(text='Yes', question=question_4)
        question_5 = TextQuestionFactory(label='dateOfReceipt', flow=flow, text='When was Delivery Received?')
        run_one = RunFactory(runnable=node_one)
        MultipleChoiceAnswerFactory(question=question_1, run=run_one, value=option_1)
        NumericAnswerFactory(question=question_2, run=run_one, value=5)
        MultipleChoiceAnswerFactory(question=question_3, run=run_one, value=option_3)
        MultipleChoiceAnswerFactory(question=question_4, run=run_one, value=option_4)
        TextAnswerFactory(run=run_one, question=question_5, value='2014-10-10')
        run_two = RunFactory(runnable=node_two)
        MultipleChoiceAnswerFactory(question=question_1, run=run_two, value=option_1)
        NumericAnswerFactory(question=question_2, run=run_two, value=500)
        MultipleChoiceAnswerFactory(question=question_3, run=run_two, value=option_3)
        MultipleChoiceAnswerFactory(question=question_4, run=run_two, value=option_4)
        TextAnswerFactory(run=run_two, question=question_5, value='2013-12-12')
        return delivery_one, node_one, purchase_order_item
