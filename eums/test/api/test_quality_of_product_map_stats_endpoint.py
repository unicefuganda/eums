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


class QualityOfProductStatsTest(AuthenticatedAPITestCase):
    def tearDown(self):
        DeliveryNode.objects.all().delete()

    def setUp(self):
        super(QualityOfProductStatsTest, self).setUp()
        self.setup_responses()

    def test_should_get_number_of_deliveries_in_good_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfDeliveriesInGoodOrder'), 2)

    def test_should_get_number_of_deliveries_in_bad_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfDeliveriesInBadOrder'), 4)

    def test_should_get_number_of_non_responses_to_quality_of_product_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfNonResponseToQualityOfProduct'), 1)

    def test_should_get_percentage_of_total_deliveries_in_good_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfDeliveriesInGoodOrder'), 28.6)

    def test_should_get_percentage_of_total_deliveries_in_bad_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfDeliveriesInBadOrder'), 57.1)

    def test_should_get_percentage_of_non_responses_to_quality_of_product_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageOfNonResponseToQualityOfProduct'), 14.3)

    def test_should_get_total_value_of_deliveries_in_good_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalValueOfDeliveriesInGoodOrder'), 300)

    def test_should_get_total_value_of_deliveries_in_bad_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalValueOfDeliveriesInBadOrder'), 1200)

    def test_should_get_total_value_of_non_responses_to_quality_of_product_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalValueOfNonResponseToQualityOfProduct'), 600)

    def test_should_get_percentage_of_total_value_of_deliveries_in_good_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageValueOfDeliveriesInGoodOrder'), 14.3)

    def test_should_get_percentage_of_total_value_of_deliveries_in_bad_order(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageValueOfDeliveriesInBadOrder'), 57.1)

    def test_should_get_percentage_of_value_of_non_responses_to_quality_of_product_question(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('percentageValueOfNonResponseToQualityOfProduct'), 28.6)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        questions, options = seed_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=10, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['IN_GOOD_CONDITION']
        )
        self.end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                     track=True, quantity=20, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['IN_GOOD_CONDITION']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                  track=True, quantity=30, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['DAMAGED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                 track=True, quantity=40, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['SUB_STANDARD']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                 track=True, quantity=40, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['EXPIRED']
        )

        end_user_node_six = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=10, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_six, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['INCOMPLETE']
        )

        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=60, item=po_item)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)


'''
        - value SATISFIED
        - percent SATISFIED/TV
        - #of SATISFIED responses
        - percent of SATISFIED/TQ

        - value NOT-SATISFIED
        - percent NOT-SATISFIED/TV
        - #of NOT-SATISFIED responses
        - percent of NOT-SATISFIED/TQ
    '''
