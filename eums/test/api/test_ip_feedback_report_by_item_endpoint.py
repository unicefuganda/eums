from eums.models import MultipleChoiceQuestion, TextQuestion, NumericAnswer, Flow, Runnable, NumericQuestion, \
    TextAnswer, \
    MultipleChoiceAnswer, Option, Run, DistributionPlan, DistributionPlanNode, Consignee, Programme, PurchaseOrderItem, \
    ReleaseOrderItem, PurchaseOrder, SalesOrder, Item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'ip-feedback-report-by-item/'


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
        delivery, _, _, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

    def test_should_return_reports_for_tracked_items_only(self):
        delivery, _, _, _, _ = self.setup_nodes_with_answers(track_delivery_two=False)
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(len(response.data['results']), 1)

    def test_should_return_items_and_all_their_answers(self):
        delivery_one, node_one, purchase_order_item, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery_one)

        response = self.client.get(ENDPOINT_URL, content_type='application/json')
        results = response.data['results'][0]

        self.assertEqual(len(response.data['results']), 2)
        self.assertDictContainsSubset({'item_description': purchase_order_item.item.description}, results)
        self.assertDictContainsSubset({'programme': delivery_one.programme.name}, results)
        self.assertDictContainsSubset({'consignee': node_one.consignee.name}, results)
        self.assertDictContainsSubset({'order_number': purchase_order_item.purchase_order.order_number}, results)
        self.assertDictContainsSubset({'quantity_shipped': node_one.quantity_in()}, results)
        self.assertDictContainsSubset({'value': int(node_one.total_value)}, results)
        self.assertEqual(len(results['answers']), 5)

    def test_should_return_date_from_delivery(self):
        delivery, _, _, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL, content_type='application/json')
        results = response.data['results'][0]

        self.assertEqual(len(response.data['results']), 2)
        self.assertDictContainsSubset({'date_of_receipt': '2014-10-10'}, results)

    def test_should_return_paginated_items_and_all_their_answers(self):
        total_number_of_items = 20
        delivery = self.setup_delivery_with_nodes(total_number_of_items)
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertIn('/api/ip-feedback-report-by-item/?page=2', response.data['next'])
        self.assertEqual(response.data['previous'], None)
        self.assertEqual(response.data['count'], total_number_of_items)
        self.assertEqual(response.data['pageSize'], 10)

        response = self.client.get(ENDPOINT_URL + '?page=2', content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['next'], None)
        self.assertIn('/api/ip-feedback-report-by-item/?page=1', response.data['previous'])
        self.assertEqual(response.data['count'], total_number_of_items)
        self.assertEqual(response.data['pageSize'], 10)

    def test_should_filter_answers_by_item_description(self):
        delivery, _, _, release_order_item, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL + '?query=baba', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'item_description': release_order_item.item.description}, results[0])

    def test_should_filter_answers_by_programme_name(self):
        delivery_one, _, _, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery_one)

        response = self.client.get(ENDPOINT_URL + '?query=my%20first', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'programme': delivery_one.programme.name}, results[0])

    def test_should_filter_answers_by_implementing_partner(self):
        delivery, node_one, _, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL + '?query=consignee%20one', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'consignee': node_one.consignee.name}, results[0])

    def test_should_filter_answers_by_purchase_order_number(self):
        delivery, node_one, _, _, _ = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL + '?query=329', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'order_number': node_one.item.number()}, results[0])

    def test_should_filter_answers_by_waybill(self):
        delivery, _, _, _, node_two = self.setup_nodes_with_answers()
        self.setup_flow_with_questions(delivery)

        response = self.client.get(ENDPOINT_URL + '?query=5540', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'order_number': node_two.item.number()}, results[0])

    def setup_nodes_with_answers(self, track_delivery_one=True, track_delivery_two=True):
        consignee_one = ConsigneeFactory(name='consignee one')
        consignee_two = ConsigneeFactory(name='consignee two')
        programme_one = ProgrammeFactory(name='my first programme')
        programme_two = ProgrammeFactory(name='my second programme')
        purchase_order_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                                       purchase_order=PurchaseOrderFactory(order_number=329293))
        release_order_item = ReleaseOrderItemFactory(item=ItemFactory(description='Baba bla bla'),
                                                     release_order=ReleaseOrderFactory(waybill=5540322))
        delivery_one = DeliveryFactory(programme=programme_one, track=track_delivery_one)
        delivery_two = DeliveryFactory(programme=programme_two, track=track_delivery_two)
        node_one = DeliveryNodeFactory(distribution_plan=delivery_one, consignee=consignee_one,
                                       item=purchase_order_item, quantity=1000)
        node_two = DeliveryNodeFactory(distribution_plan=delivery_two, consignee=consignee_two, item=release_order_item,
                                       quantity=500)
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
        return delivery_one, node_one, purchase_order_item, release_order_item, node_two

    def setup_delivery_with_nodes(self, number_of_nodes):
        consignee_one = ConsigneeFactory(name='consignee one')
        programme_one = ProgrammeFactory(name='my first programme')
        po_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                           purchase_order=PurchaseOrderFactory(order_number=329293))

        delivery = DeliveryFactory(programme=programme_one, track=True)
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

        for index in range(number_of_nodes):
            node = DeliveryNodeFactory(distribution_plan=delivery, consignee=consignee_one, item=po_item)

            run_one = RunFactory(runnable=node)
            MultipleChoiceAnswerFactory(question=question_1, run=run_one, value=option_1)
            NumericAnswerFactory(question=question_2, run=run_one, value=5)
            MultipleChoiceAnswerFactory(question=question_3, run=run_one, value=option_3)
            MultipleChoiceAnswerFactory(question=question_4, run=run_one, value=option_4)
            TextAnswerFactory(run=run_one, question=question_5, value='2014-10-10')

        return delivery

    def setup_flow_with_questions(self, delivery):
        flow = FlowFactory(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
        run = RunFactory(runnable=delivery)

        delivery_received_qn = MultipleChoiceQuestionFactory(label='deliveryReceived', flow=flow)
        OptionFactory(question=delivery_received_qn, text='Yes')
        OptionFactory(question=delivery_received_qn, text='No')
        date_question = TextQuestionFactory(label='dateOfReceipt', flow=flow)
        good_order_qn = MultipleChoiceQuestionFactory(label='isDeliveryInGoodOrder', flow=flow)
        OptionFactory(question=good_order_qn, text='Yes')
        OptionFactory(question=good_order_qn, text='No')
        OptionFactory(question=good_order_qn, text='Incomplete')
        satisfied_qn = MultipleChoiceQuestionFactory(label='areYouSatisfied', flow=flow)
        OptionFactory(question=satisfied_qn, text='Yes')
        OptionFactory(question=satisfied_qn, text='No')
        TextQuestionFactory(label='additionalDeliveryComments', flow=flow)

        TextAnswerFactory(run=run, question=date_question, value='2014-10-10')
