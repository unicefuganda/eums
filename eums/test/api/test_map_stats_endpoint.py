from eums.fixtures.end_user_questions import *
from eums.models import Run
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'map-stats/'


class DeliveryStatsEndpointTest(AuthenticatedAPITestCase):
    def tearDown(self):
        DeliveryNode.objects.all().delete()

    def setUp(self):
        super(DeliveryStatsEndpointTest, self).setUp()
        self.setup_responses()

    def test_should_get_number_of_successful_deliveries(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfSuccessfulProductDeliveries'), 2)

    def test_should_get_number_of_successful_deliveries_from_only_the_latest_scheduled_or_completed_runs(self):
        canceled_run = RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.cancelled)
        MultipleChoiceAnswerFactory(
            run=canceled_run,
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_RECEIVED
        )
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfSuccessfulProductDeliveries'), 2)

    def test_should_get_percentage_of_total_deliveries_that_were_successful(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfSuccessfulDeliveries'), 33.3)

    def test_should_get_number_of_unsuccessful_deliveries(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfUnsuccessfulProductDeliveries'), 3)

    def test_should_get_percentage_of_total_deliveries_that_were_unsuccessful(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfUnsuccessfulDeliveries'), 50)

    def test_should_get_number_of_non_responses_to_product_received_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfNonResponseToProductReceived'), 1)

    def test_should_get_percentage_of_non_responses_to_product_received_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfNonResponseToProductReceived'), 16.7)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        questions, options = seed_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=10,
                                                item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        self.end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=20,
                                                     item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=30,
                                                  item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=40,
                                                 item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=50,
                                                 item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=60,
                                                item=po_item)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)

    def test_should_get_total_number_of_deliveries(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalNumberOfDeliveries'), 6)

    def test_should_get_total_value_of_deliveries(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalValueOfDeliveries'), 2100)

    def test_should_get_total_value_of_successful_deliveries(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalValueOfSuccessfulDeliveries'), 300)

        # def test_should_get_percentage_of_total_deliveries_that_were_successful(self):
        #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        #     self.assertEqual(response.data.get('percentageOfSuccessfulDeliveries'), 33.3)
        #
        # def test_should_get_number_of_unsuccessful_deliveries(self):
        #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        #     self.assertEqual(response.data.get('numberOfUnsuccessfulProductDeliveries'), 3)
        #
        # def test_should_get_percentage_of_total_deliveries_that_were_unsuccessful(self):
        #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        #     self.assertEqual(response.data.get('percentageOfUnsuccessfulDeliveries'), 50)
        #
        # def test_should_get_number_of_non_responses_to_product_received_question(self):
        #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        #     self.assertEqual(response.data.get('numberOfNonResponseToProductReceived'), 1)
        #
        # def test_should_get_percentage_of_non_responses_to_product_received_question(self):
        #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        #     self.assertEqual(response.data.get('percentageOfNonResponseToProductReceived'), 16.7)
        #


'''
'percentageOfSuccessfulDeliveries': Decimal('33.3'),
            'numberOfUnSuccessfulProductDeliveries': 3,
            'percentageOfUnSuccessfulDeliveries': Decimal('50.0'),
            'numberOfNonResponseToProductReceived': 1,
            'percentageOfNonResponseToProductReceived': Decimal('16.7'),

        - Total Value sent (TV)

        - total value received
        - percent received/sent
        - # of YES responses to "Did you receive?"
        - percent YES/total-qns-sent (TQ)

        - total not received
        - percent not-received/sent
        - # of NO responses to "Did you receive?"
        - percent NO/total-qns-sent

        - non-response to did you receive
        - # of NON-RESPONSE to "Did you receive?"
        - percent NON-RESPONSE/total-qns-sent

        - value NO-ISSUES
        - percent NO-ISSUES/TV
        - #of NO-ISSUES responses
        - percent of NO-ISSUES/TQ

        - value WITH-ISSUES
        - percent WITH-ISSUES/TV
        - #of WITH-ISSUES responses
        - percent of WITH-ISSUES/TQ

        - value NO-RESPONSE to Quality qn
        - percent NO-RESPONSE/TV
        - #of NO-RESPONSE responses
        - percent of NO-RESPONSE/TQ

        - value SATISFIED
        - percent SATISFIED/TV
        - #of SATISFIED responses
        - percent of SATISFIED/TQ

        - value NOT-SATISFIED
        - percent NOT-SATISFIED/TV
        - #of NOT-SATISFIED responses
        - percent of NOT-SATISFIED/TQ
    '''
