from eums.models import Run, MultipleChoiceQuestion
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/details/'


class ProductReceivedStatsTest(DeliveryStatsTestCase):
    def setUp(self):
        super(ProductReceivedStatsTest, self).setUp()
        self.setup_responses()

    def test_should_get_number_of_successful_deliveries_from_only_the_latest_scheduled_or_completed_runs(self):
        canceled_run = RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.cancelled)
        from eums.fixtures.end_user_questions import WAS_PRODUCT_RECEIVED, PRODUCT_WAS_RECEIVED
        MultipleChoiceAnswerFactory(run=canceled_run,
                                    question=WAS_PRODUCT_RECEIVED,
                                    value=PRODUCT_WAS_RECEIVED)
        response = self.client.get('%s?treePosition=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('numberOfSuccessfulProductDeliveries'), 2)

    def test_should_product_received_question_stats(self):
        response = self.client.get('%s?treePosition=END_USER' % ENDPOINT_URL)

        self.assertEqual(response.data.get('totalNumberOfDeliveries'), 6)
        self.assertEqual(response.data.get('totalValueOfDeliveries'), 2100)
        self.assertEqual(response.data.get('numberOfSuccessfulProductDeliveries'), 2)
        self.assertEqual(response.data.get('numberOfUnsuccessfulProductDeliveries'), 3)
        self.assertEqual(response.data.get('numberOfNonResponseToProductReceived'), 1)
        self.assertEqual(response.data.get('percentageOfSuccessfulDeliveries'), 33.3)
        self.assertEqual(response.data.get('percentageOfUnsuccessfulDeliveries'), 50)
        self.assertEqual(response.data.get('percentageOfNonResponseToProductReceived'), 16.7)
        self.assertEqual(response.data.get('totalValueOfSuccessfulDeliveries'), 300)
        self.assertEqual(response.data.get('totalValueOfUnsuccessfulProductDeliveries'), 1200)
        self.assertEqual(response.data.get('totalValueOfNonResponseToProductReceived'), 600)
        self.assertEqual(response.data.get('percentageValueOfSuccessfulDeliveries'), 14.3)
        self.assertEqual(response.data.get('percentageValueOfUnsuccessfulDeliveries'), 57.1)
        self.assertEqual(response.data.get('percentageValueOfNonResponseToProductReceived'), 28.6)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        from eums.fixtures.end_user_questions import seed_questions
        questions, options = seed_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=10,
                                                distribution_plan=None,
                                                item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        self.end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=20,
                                                     distribution_plan=None,
                                                     item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=30,
                                                  distribution_plan=None,
                                                  item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=40,
                                                 distribution_plan=None,
                                                 item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=50,
                                                 distribution_plan=None,
                                                 item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=60,
                                                distribution_plan=None,
                                                item=po_item)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)
