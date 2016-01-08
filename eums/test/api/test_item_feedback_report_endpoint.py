from eums.models import MultipleChoiceQuestion, TextQuestion, NumericAnswer, Flow, Runnable, NumericQuestion, \
    TextAnswer, \
    MultipleChoiceAnswer, Option, Run, DistributionPlan, DistributionPlanNode, Consignee, Programme, PurchaseOrderItem, \
    ReleaseOrderItem, PurchaseOrder, SalesOrder, Item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
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
        node_one, purchase_order_item, _, node_two, _, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        results = response.data['results']

        self.assertEqual(len(response.data['results']), 6)
        self.assertFieldExists({'item_description': purchase_order_item.item.description}, results)
        self.assertFieldExists({'programme': {'id': node_one.programme.id, 'name': node_one.programme.name}}, results)
        self.assertFieldExists({'consignee': node_one.consignee.name}, results)
        self.assertFieldExists({'implementing_partner': node_one.ip.name}, results)
        self.assertFieldExists({'order_number': purchase_order_item.purchase_order.order_number}, results)
        self.assertFieldExists({'quantity_shipped': node_one.quantity_in()}, results)
        self.assertFieldExists({'value': node_one.total_value}, results)
        self.assertFieldExists({'tree_position': node_one.tree_position}, results)
        self.assertFieldExists({'additional_remarks': node_one.additional_remarks}, results)
        self.assertGreaterEqual(len(results[0]['answers']), 3)

    def assertFieldExists(self, field, value_list):
        field_exists = False
        for key, value in field.iteritems():
            for actual in value_list:
                if key in actual and value == actual[key]:
                    field_exists = True
                    break
        self.assertTrue(field_exists)

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
        node_one, _, release_order_item, node_two, _, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?item_description=baba', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 2)
        self.assertDictContainsSubset({'item_description': release_order_item.item.description}, results[0])

    def test_should_filter_answers_by_location(self):
        node_one, _, release_order_item, node_two, _, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?location=Fort portal', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertDictContainsSubset({'location': 'Fort portal'}, results[0])

    def test_should_filter_answers_by_programme(self):
        node_one, _, _, node_two, _, _ = self.setup_nodes_with_answers()
        response = self.client.get(ENDPOINT_URL + '?programme_id=%s' % node_one.programme.id,
                                   content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 4)
        self.assertDictContainsSubset({'programme': {'id': node_one.programme.id, 'name': node_one.programme.name}},
                                      results[0])

    def test_should_filter_answers_by_implementing_partner(self):
        node_one, _, _, node_two, _, ip = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?ip_id=%s' % ip.id,
                                   content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 6)

    def test_should_filter_answers_by_purchase_order_number(self):
        node_one, _, _, node_two, _, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?po_waybill=329', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 4)
        self.assertDictContainsSubset({'order_number': node_one.item.number()}, results[0])

    def test_should_filter_answers_by_waybill(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?po_waybill=5540', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 2)
        self.assertDictContainsSubset({'order_number': ip_node_two.item.number()}, results[0])

    def test_should_filter_answers_by_tree_position_implementing_partner(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?tree_position=IMPLEMENTING_PARTNER',
                                   content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 3)
        self.assertDictContainsSubset({'consignee': ip_node_two.consignee.name}, results[0])

    def test_should_filter_answers_by_tree_position_middle_man(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?tree_position=MIDDLE_MAN', content_type='application/json')

        results = response.data['results'][0]

        self.assertEqual(len(response.data['results']), 1)
        self.assertDictContainsSubset({'consignee': 'middle man one'}, results)
        self.assertEqual(len(results['answers']), 3)

    def test_should_filter_by_received(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?received=No', content_type='application/json')
        self.assertEqual(len(response.data['results']), 1)

        response = self.client.get(ENDPOINT_URL + '?received=Yes', content_type='application/json')
        self.assertEqual(len(response.data['results']), 5)

    def test_should_filter_by_satisfied(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?satisfied=No', content_type='application/json')
        self.assertEqual(len(response.data['results']), 1)

        response = self.client.get(ENDPOINT_URL + '?satisfied=Yes', content_type='application/json')
        self.assertEqual(len(response.data['results']), 3)

    def test_should_filter_by_quality(self):
        node_one, _, _, _, ip_node_two, _ = self.setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?quality=Good', content_type='application/json')
        self.assertEqual(len(response.data['results']), 1)

        response = self.client.get(ENDPOINT_URL + '?quality=Damaged', content_type='application/json')
        self.assertEqual(len(response.data['results']), 3)

    def setup_nodes_with_answers(self):
        ip = ConsigneeFactory(name='ip one')
        middle_man = ConsigneeFactory(name='middle man one', type=Consignee.TYPES.middle_man)
        end_user_one = ConsigneeFactory(name='consignee one', type=Consignee.TYPES.end_user)
        end_user_two = ConsigneeFactory(name='consignee two', type=Consignee.TYPES.end_user)
        programme_one = ProgrammeFactory(name='my first programme')
        programme_two = ProgrammeFactory(name='my second programme')
        purchase_order_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                                       purchase_order=PurchaseOrderFactory(order_number=329293))
        release_order_item = ReleaseOrderItemFactory(item=ItemFactory(description='Baba bla bla'),
                                                     release_order=ReleaseOrderFactory(waybill=5540322))

        ip_node_one = DeliveryNodeFactory(consignee=ip, item=purchase_order_item, quantity=1500,
                                          programme=programme_one, track=True,
                                          distribution_plan=DeliveryFactory(track=True),
                                          location='Fort portal', tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        ip_node_two = DeliveryNodeFactory(consignee=ip, item=release_order_item, quantity=100,
                                          distribution_plan=DeliveryFactory(track=True), programme=programme_two,
                                          location='Kampala', tree_position=Flow.Label.IMPLEMENTING_PARTNER, track=True)

        ip_node_three = DeliveryNodeFactory(consignee=ip, item=release_order_item, quantity=100,
                                            distribution_plan=DeliveryFactory(track=True), programme=programme_two,
                                            location='Gulu', tree_position=Flow.Label.IMPLEMENTING_PARTNER, track=True)

        middle_man_node = DeliveryNodeFactory(consignee=middle_man, item=purchase_order_item,
                                              programme=programme_one, location='Wakiso', track=True,
                                              tree_position=Flow.Label.MIDDLE_MAN, parents=[(ip_node_one, 1500)],
                                              distribution_plan=None)
        end_user_node_one = DeliveryNodeFactory(consignee=end_user_one,
                                                item=purchase_order_item, parents=[(middle_man_node, 1000)],
                                                programme=programme_one, location='Amuru', track=True,
                                                distribution_plan=None)
        end_user_node_two = DeliveryNodeFactory(consignee=end_user_two, item=purchase_order_item, track=True,
                                                parents=[(middle_man_node, 500)], programme=programme_one,
                                                distribution_plan=None)

        # IP_ITEM Flow and Questions
        ip_item_flow = FlowFactory(label=Flow.Label.IMPLEMENTING_PARTNER)
        ip_item_question_1 = MultipleChoiceQuestionFactory(text='Was the item received?', label='itemReceived',
                                                           when_answered='update_consignee_inventory',
                                                           flow=ip_item_flow, position=1)
        ip_item_option_1 = OptionFactory(text='Yes', question=ip_item_question_1)
        ip_item_option_no = OptionFactory(text='No', question=ip_item_question_1)
        ip_item_question_2 = NumericQuestionFactory(text='How much was received?', label='amountReceived',
                                                    when_answered='update_consignee_stock_level', flow=ip_item_flow,
                                                    position=3)
        ip_item_question_3 = MultipleChoiceQuestionFactory(text='What is the quality of the product?',
                                                           label='qualityOfProduct',
                                                           flow=ip_item_flow, position=3)
        ip_item_option_2 = OptionFactory(text='Good', question=ip_item_question_3)
        ip_item_option_3 = OptionFactory(text='Damaged', question=ip_item_question_3)
        ip_item_question_4 = MultipleChoiceQuestionFactory(text='Are you satisfied with the product?',
                                                           label='satisfiedWithProduct', flow=ip_item_flow, position=4)
        ip_item_option_4 = OptionFactory(text='Yes', question=ip_item_question_4)
        ip_item_option_5 = OptionFactory(text='No', question=ip_item_question_4)

        # MIDDLE_MAN Flow and Questions
        middle_man_flow = FlowFactory(label=Flow.Label.MIDDLE_MAN)
        mm_question_1 = MultipleChoiceQuestionFactory(text='Was product received?', label='productReceived',
                                                      flow=middle_man_flow, position=1)
        mm_option_1 = OptionFactory(text='Yes', question=mm_question_1)
        mm_option_2 = OptionFactory(text='No', question=mm_question_1)
        mm_question_2 = TextQuestionFactory(label='dateOfReceipt', flow=middle_man_flow,
                                            text='When was item received?', position=2)
        mm_question_3 = NumericQuestionFactory(text='What is the amount received?', label='amountReceived',
                                               flow=middle_man_flow, position=3)

        end_user_flow = FlowFactory(label=Flow.Label.END_USER)
        eu_question_1 = MultipleChoiceQuestionFactory(text='Was the item received?', label='itemReceived',
                                                      flow=end_user_flow, position=1)
        eu_option_1 = OptionFactory(text='Yes', question=eu_question_1)
        eu_question_2 = NumericQuestionFactory(text='How much was received?', label='amountReceived',
                                               flow=end_user_flow)
        eu_question_3 = MultipleChoiceQuestionFactory(text='What is the quality of the product?',
                                                      label='qualityOfProduct', flow=end_user_flow, position=3)
        eu_option_3 = OptionFactory(text='Damaged', question=eu_question_3)
        eu_question_4 = MultipleChoiceQuestionFactory(text='Are you satisfied with the product?',
                                                      label='satisfiedWithProduct', flow=end_user_flow, position=4)
        eu_option_4 = OptionFactory(text='Yes', question=eu_question_4)
        eu_question_5 = TextQuestionFactory(label='dateOfReceipt', flow=end_user_flow,
                                            text='When was Delivery Received?')

        ip_run_one = RunFactory(runnable=ip_node_one)
        MultipleChoiceAnswerFactory(question=ip_item_question_1, run=ip_run_one, value=ip_item_option_1)
        NumericAnswerFactory(question=ip_item_question_2, run=ip_run_one, value=1500)
        MultipleChoiceAnswerFactory(question=ip_item_question_3, run=ip_run_one, value=ip_item_option_2)
        MultipleChoiceAnswerFactory(question=ip_item_question_4, run=ip_run_one, value=ip_item_option_4)

        ip_run_three = RunFactory(runnable=ip_node_three)
        MultipleChoiceAnswerFactory(question=ip_item_question_1, run=ip_run_three, value=ip_item_option_no)

        ip_run_two = RunFactory(runnable=ip_node_two)
        MultipleChoiceAnswerFactory(question=ip_item_question_1, run=ip_run_two, value=ip_item_option_1)
        NumericAnswerFactory(question=ip_item_question_2, run=ip_run_two, value=50)
        MultipleChoiceAnswerFactory(question=ip_item_question_3, run=ip_run_two, value=ip_item_option_3)
        MultipleChoiceAnswerFactory(question=ip_item_question_4, run=ip_run_two, value=ip_item_option_5)

        middle_man_node_run = RunFactory(runnable=middle_man_node)
        MultipleChoiceAnswerFactory(question=mm_question_1, run=middle_man_node_run, value=mm_option_1)
        TextAnswerFactory(question=mm_question_2, run=middle_man_node_run, value='2014-9-25')
        NumericAnswerFactory(question=mm_question_3, run=middle_man_node_run, value=1500)

        end_user_run_one = RunFactory(runnable=end_user_node_one)
        MultipleChoiceAnswerFactory(question=eu_question_1, run=end_user_run_one, value=eu_option_1)
        NumericAnswerFactory(question=eu_question_2, run=end_user_run_one, value=5)
        MultipleChoiceAnswerFactory(question=eu_question_3, run=end_user_run_one, value=eu_option_3)
        MultipleChoiceAnswerFactory(question=eu_question_4, run=end_user_run_one, value=eu_option_4)
        TextAnswerFactory(run=end_user_run_one, question=eu_question_5, value='2014-10-10')

        end_user_run_two = RunFactory(runnable=end_user_node_two)
        MultipleChoiceAnswerFactory(question=eu_question_1, run=end_user_run_two, value=eu_option_1)
        NumericAnswerFactory(question=eu_question_2, run=end_user_run_two, value=500)
        MultipleChoiceAnswerFactory(question=eu_question_3, run=end_user_run_two, value=eu_option_3)
        MultipleChoiceAnswerFactory(question=eu_question_4, run=end_user_run_two, value=eu_option_4)
        TextAnswerFactory(run=end_user_run_two, question=eu_question_5, value='2013-12-12')
        return end_user_node_one, purchase_order_item, release_order_item, end_user_node_two, ip_node_two, ip

    def setup_multiple_nodes_with_answers(self, number_of_nodes):
        consignee_one = ConsigneeFactory(name='consignee one')
        programme_one = ProgrammeFactory(name='my first programme')
        po_item = PurchaseOrderItemFactory(item=ItemFactory(description='Mama kit'),
                                           purchase_order=PurchaseOrderFactory(order_number=329293))

        flow = FlowFactory(label='WEB')
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
            node = DeliveryNodeFactory(consignee=consignee_one, item=po_item, programme=programme_one,
                                       distribution_plan=DeliveryFactory(track=True))

            run_one = RunFactory(runnable=node)
            MultipleChoiceAnswerFactory(question=question_1, run=run_one, value=option_1)
            NumericAnswerFactory(question=question_2, run=run_one, value=5)
            MultipleChoiceAnswerFactory(question=question_3, run=run_one, value=option_3)
            MultipleChoiceAnswerFactory(question=question_4, run=run_one, value=option_4)
            TextAnswerFactory(run=run_one, question=question_5, value='2014-10-10')
            nodes.append(node)

        return nodes
