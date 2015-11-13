import urllib

from eums.models import MultipleChoiceQuestion, TextQuestion, NumericAnswer, Flow, Runnable, NumericQuestion, \
    TextAnswer, \
    MultipleChoiceAnswer, Option, Run, DistributionPlan, DistributionPlanNode, Consignee, Programme, PurchaseOrderItem, \
    ReleaseOrderItem, PurchaseOrder, SalesOrder, Item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
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

ENDPOINT_URL = BACKEND_URL + 'item-feedback-report/'


class ItemFeedbackReportEndPointTest(AuthenticatedAPITestCase):
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

    def test_ips_see_only_his_deliveries(self):
        consignee = ConsigneeFactory()
        self.logout()
        self.log_consignee_in(consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data['results']), 0)

    def test_returns_200_when_admin(self):
        self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

    def test_should_return_items_and_all_their_answers(self):
        node_one, purchase_order_item, _, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        results = response.data['results'][0]

        self.assertEqual(len(response.data['results']), 2)
        self.assertDictContainsSubset({'item_description': purchase_order_item.item.description}, results)
        self.assertDictContainsSubset({'programme': node_one.programme.name}, results)
        self.assertDictContainsSubset({'consignee': node_one.consignee.name}, results)
        self.assertDictContainsSubset({'implementing_partner': node_one.ip.name}, results)
        self.assertDictContainsSubset({'order_number': purchase_order_item.purchase_order.order_number}, results)
        self.assertDictContainsSubset({'quantity_shipped': node_one.quantity_in()}, results)
        self.assertDictContainsSubset({'value': node_one.total_value}, results)
        self.assertEqual(len(results['answers']), 5)

    def test_should_return_paginated_items_and_all_their_answers(self):
        total_number_of_items = 20
        self.setup_multiple_nodes_with_answers(total_number_of_items)

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertIn('/api/item-feedback-report/?page=2', response.data['next'])
        self.assertEqual(response.data['previous'], None)
        self.assertEqual(response.data['count'], total_number_of_items)
        self.assertEqual(response.data['pageSize'], 10)

        response = self.client.get(ENDPOINT_URL + '?page=2', content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['next'], None)
        self.assertIn('/api/item-feedback-report/?page=1', response.data['previous'])
        self.assertEqual(response.data['count'], total_number_of_items)
        self.assertEqual(response.data['pageSize'], 10)

    def test_should_filter_answers_by_item_description(self):
        node_one, _, release_order_item, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?query=baba', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'item_description': release_order_item.item.description}, results[0])

    def test_should_filter_answers_by_location(self):
        node_one, _, release_order_item, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?location=Fort portal', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'location': 'Fort portal'}, results[0])

    def test_should_filter_answers_by_programme_name(self):
        node_one, _, _, node_two = self.setup_nodes_with_answers()
        param = urllib.quote_plus(node_one.programme.name)
        response = self.client.get(ENDPOINT_URL + '?query=' + param, content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'programme': node_one.programme.name}, results[0])

    def test_should_filter_answers_by_implementing_partner(self):
        node_one, _, _, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?query=consignee%20one', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'consignee': node_one.consignee.name}, results[0])

    def test_should_filter_answers_by_purchase_order_number(self):
        node_one, _, _, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?query=329', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'order_number': node_one.item.number()}, results[0])

    def test_should_filter_answers_by_waybill(self):
        node_one, _, _, node_two = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?query=5540', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'order_number': node_two.item.number()}, results[0])

    def setup_nodes_with_answers(self):
        consignee_one = ConsigneeFactory(name='consignee one')
        consignee_two = ConsigneeFactory(name='consignee two')
        programme_one = ProgrammeFactory(name='my first programme')
        programme_two = ProgrammeFactory(name='my second programme')
        purchase_order_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                                       purchase_order=PurchaseOrderFactory(order_number=329293))
        release_order_item = ReleaseOrderItemFactory(item=ItemFactory(description='Baba bla bla'),
                                                     release_order=ReleaseOrderFactory(waybill=5540322))
        node_one = DeliveryNodeFactory(consignee=consignee_one,
                                       item=purchase_order_item, quantity=1000, programme=programme_one,
                                       location='Fort portal')
        node_two = DeliveryNodeFactory(consignee=consignee_two, item=release_order_item,
                                       quantity=500, programme=programme_two)
        flow = FlowFactory(for_runnable_type=Runnable.END_USER)
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
        return node_one, purchase_order_item, release_order_item, node_two

    def setup_multiple_nodes_with_answers(self, number_of_nodes):
        consignee_one = ConsigneeFactory(name='consignee one')
        programme_one = ProgrammeFactory(name='my first programme')
        po_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                           purchase_order=PurchaseOrderFactory(order_number=329293))

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
        nodes = []

        for index in range(number_of_nodes):
            node = DeliveryNodeFactory(consignee=consignee_one, item=po_item, programme=programme_one)

            run_one = RunFactory(runnable=node)
            MultipleChoiceAnswerFactory(question=question_1, run=run_one, value=option_1)
            NumericAnswerFactory(question=question_2, run=run_one, value=5)
            MultipleChoiceAnswerFactory(question=question_3, run=run_one, value=option_3)
            MultipleChoiceAnswerFactory(question=question_4, run=run_one, value=option_4)
            TextAnswerFactory(run=run_one, question=question_5, value='2014-10-10')
            nodes.append(node)

        return nodes
