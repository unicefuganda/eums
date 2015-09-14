from eums.models import Question, DistributionPlanNode
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory
from eums.test.factories.run_factory import RunFactory


ENDPOINT_URL = BACKEND_URL + 'ip-feedback-report-by-delivery/'


class IpFeedBackReportByDeliveryEndpoint(AuthenticatedAPITestCase):
    def tearDown(self):
        DistributionPlanNode.objects.all().delete()

    def test_returns_401_unless_admin(self):
        consignee = ConsigneeFactory()
        self.logout()
        self.log_consignee_in(consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 401)

    def test_should_return_delivery_answers(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        delivery = DeliveryFactory(track=True, programme=ProgrammeFactory(name=programme_name),
                                   consignee=ConsigneeFactory(name=wakiso))
        order_number = 34230304
        DeliveryNodeFactory(distribution_plan=delivery,
                            item=PurchaseOrderItemFactory(
                                purchase_order=PurchaseOrderFactory(order_number=order_number)))
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=self.delivery_received_qtn, value=self.yes_one)
        delivery_date = '12/03/2015'
        TextAnswerFactory(run=run, question=self.date_received_qtn, value=delivery_date)
        MultipleChoiceAnswerFactory(run=run, question=self.delivery_in_good_order, value=self.yes_two)
        MultipleChoiceAnswerFactory(run=run, question=self.satisfied_with_delivery, value=self.no_three)
        not_satisfied = 'Not Satisfied!!'
        TextAnswerFactory(run=run, question=self.additional_comments, value=not_satisfied)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'dateOfReceipt': '12/03/2015', 'orderNumber': order_number,
                              'programme': programme_name, 'consignee': wakiso,
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'additionalDeliveryComments': not_satisfied}]

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], expected_response)

    def test_should_return_delivery_empty_value_if_no_answers(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        delivery = DeliveryFactory(track=True, programme=ProgrammeFactory(name=programme_name),
                                   consignee=ConsigneeFactory(name=wakiso))
        order_number = 34230334
        DeliveryNodeFactory(distribution_plan=delivery,
                            item=PurchaseOrderItemFactory(
                                purchase_order=PurchaseOrderFactory(order_number=order_number)))
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=self.delivery_received_qtn, value=self.yes_one)
        MultipleChoiceAnswerFactory(run=run, question=self.satisfied_with_delivery, value=self.no_three)

        yes = 'Yes'
        no = 'No'
        empty = ''
        expected_response = [{'deliveryReceived': yes, 'dateOfReceipt': empty, 'orderNumber': order_number,
                              'programme': programme_name, 'consignee': wakiso,
                              Question.LABEL.isDeliveryInGoodOrder: empty, 'satisfiedWithDelivery': no,
                              'additionalDeliveryComments': empty}]

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], expected_response)

    def test_should_return_delivery_answers_for_tracked_deliveries(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        delivery = DeliveryFactory(track=True, programme=ProgrammeFactory(name=programme_name),
                                   consignee=ConsigneeFactory(name=wakiso))
        order_number = 34230304
        DeliveryNodeFactory(distribution_plan=delivery,
                            item=PurchaseOrderItemFactory(
                                purchase_order=PurchaseOrderFactory(order_number=order_number)))
        DeliveryNodeFactory()
        DeliveryNodeFactory()
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=self.delivery_received_qtn, value=self.yes_one)
        delivery_date = '12/03/2015'
        TextAnswerFactory(run=run, question=self.date_received_qtn, value=delivery_date)
        MultipleChoiceAnswerFactory(run=run, question=self.delivery_in_good_order, value=self.yes_two)
        MultipleChoiceAnswerFactory(run=run, question=self.satisfied_with_delivery, value=self.no_three)
        not_satisfied = 'Not Satisfied!!'
        TextAnswerFactory(run=run, question=self.additional_comments, value=not_satisfied)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'dateOfReceipt': '12/03/2015', 'orderNumber': order_number,
                              'programme': programme_name, 'consignee': wakiso,
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'additionalDeliveryComments': not_satisfied}]
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], expected_response)

    def _create_questions(self):
        flow = FlowFactory(for_runnable_type='IMPLEMENTING_PARTNER')

        self.delivery_received_qtn = MultipleChoiceQuestionFactory(text='Was delivery received?', flow=flow,
                                                                   position=1,
                                                                   label=Question.LABEL.deliveryReceived)
        self.yes_one = OptionFactory(text='Yes', question=self.delivery_received_qtn)
        self.no_one = OptionFactory(text='No', question=self.delivery_received_qtn)

        self.date_received_qtn = TextQuestionFactory(text='When was delivery received?', flow=flow, position=2,
                                                     label='dateOfReceipt')

        self.delivery_in_good_order = MultipleChoiceQuestionFactory(text='Was delivery in good condition?',
                                                                    flow=flow, position=3,
                                                                    label=Question.LABEL.isDeliveryInGoodOrder)
        self.yes_two = OptionFactory(text='Yes', question=self.delivery_in_good_order)
        self.no_two = OptionFactory(text='No', question=self.delivery_in_good_order)

        self.satisfied_with_delivery = MultipleChoiceQuestionFactory(text="Are you satisfied with the delivery?",
                                                                     flow=flow, position=4,
                                                                     label="satisfiedWithDelivery")
        self.yes_three = OptionFactory(text="Yes", question=self.satisfied_with_delivery)
        self.no_three = OptionFactory(text="No", question=self.satisfied_with_delivery)

        self.additional_comments = TextQuestionFactory(text='Additional Remarks', flow=flow, position=5,
                                                       label='additionalDeliveryComments')