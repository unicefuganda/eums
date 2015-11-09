from eums.models import Run, MultipleChoiceQuestion
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/details/'


class SatisfactionWithProductForLocationTest(DeliveryStatsTestCase):
    def setUp(self):
        super(SatisfactionWithProductForLocationTest, self).setUp()
        self.selected_location = 'Jinja'
        self.other_location = 'XXX'
        self.setup_responses()

    def test_check_that_other_location_data_is_present(self):
        response = self.client.get('%s?treePosition=END_USER' % ENDPOINT_URL)
        self.assertEqual(response.data.get('totalNumberOfDeliveries'), 6)

    def test_should_provide_satisfaction_with_product_stats_for_a_location(self):
        response = self.client.get('%s?treePosition=END_USER&location=%s' % (ENDPOINT_URL, self.selected_location))

        self.assertEqual(response.data.get('numberOfSatisfactoryDeliveries'), 1)
        self.assertEqual(response.data.get('numberOfUnsatisfactoryDeliveries'), 1)
        self.assertEqual(response.data.get('numberOfNonResponseToSatisfactionWithProduct'), 1)
        self.assertEqual(response.data.get('numberOfAwaitingResponseToSatisfactionWithProduct'), 0)

        self.assertEqual(response.data.get('percentageOfSatisfactoryDeliveries'), 33.3)
        self.assertEqual(response.data.get('percentageOfUnsatisfactoryDeliveries'), 33.3)
        self.assertEqual(response.data.get('percentageOfNonResponseToSatisfactionWithProduct'), 33.3)
        self.assertEqual(response.data.get('percentageOfAwaitingResponseToSatisfactionWithProduct'), 0)

        self.assertEqual(response.data.get('totalValueOfSatisfactoryDeliveries'), 100)
        self.assertEqual(response.data.get('totalValueOfUnsatisfactoryDeliveries'), 300)
        self.assertEqual(response.data.get('totalValueOfNonResponseToSatisfactionWithProduct'), 600)
        self.assertEqual(response.data.get('totalValueOfAwaitingResponseToSatisfactionWithProduct'), 0)

        self.assertEqual(response.data.get('percentageValueOfSatisfactoryDeliveries'), 10.0)
        self.assertEqual(response.data.get('percentageValueOfUnsatisfactoryDeliveries'), 30.0)
        self.assertEqual(response.data.get('percentageValueOfNonResponseToSatisfactionWithProduct'), 60.0)
        self.assertEqual(response.data.get('percentageValueOfAwaitingResponseToSatisfactionWithProduct'), 0.0)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()
        from eums.fixtures.end_user_questions import seed_questions
        questions, options = seed_questions()
        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)

        end_user_node_one = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True, quantity=10,
            item=po_item,
            location=self.selected_location
        )
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['SATISFIED']
        )

        end_user_node_two = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True,
            quantity=30,
            item=po_item,
            location=self.selected_location
        )
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['NOT_SATISFIED']
        )

        non_response_node_one = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True, quantity=60,
            item=po_item,
            location=self.selected_location
        )
        RunFactory(runnable=non_response_node_one, status=Run.STATUS.scheduled)

        end_user_node_three = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True, quantity=10,
            item=po_item,
            location=self.other_location
        )
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['SATISFIED']
        )

        end_user_node_four = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True, quantity=30,
            item=po_item,
            location=self.other_location
        )
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['NOT_SATISFIED']
        )

        non_response_node_two = DeliveryNodeFactory(
            tree_position=DeliveryNode.END_USER,
            distribution_plan=None,
            track=True,
            quantity=60,
            item=po_item,
            location=self.other_location
        )
        RunFactory(runnable=non_response_node_two, status=Run.STATUS.scheduled)
