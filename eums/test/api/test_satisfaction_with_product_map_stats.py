from eums.fixtures.end_user_questions import *
from eums.models import Run, Question
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'map-stats/'


class QualityOfProductStatsTest(AuthenticatedAPITestCase):
    @classmethod
    def setUpClass(cls):
        super(QualityOfProductStatsTest, cls).setUpClass()
        cls.setup_responses()

    @classmethod
    def tearDownClass(cls):
        DeliveryNode.objects.all().delete()
        Question.objects.all().delete()

    def test_should_get_quality_of_product_stats(self):
        response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)

        self.assertEqual(response.data.get('numberOfSatisfactoryDeliveries'), 2)
        self.assertEqual(response.data.get('numberOfUnsatisfactoryDeliveries'), 3)
        self.assertEqual(response.data.get('numberOfNonResponseToSatisfactionWithProduct'), 1)
        self.assertEqual(response.data.get('percentageOfSatisfactoryDeliveries'), 33.3)
        self.assertEqual(response.data.get('percentageOfUnsatisfactoryDeliveries'), 50)
        self.assertEqual(response.data.get('percentageOfNonResponseToSatisfactionWithProduct'), 16.7)
        self.assertEqual(response.data.get('totalValueOfSatisfactoryDeliveries'), 300)
        self.assertEqual(response.data.get('totalValueOfUnsatisfactoryDeliveries'), 1200)
        self.assertEqual(response.data.get('totalValueOfNonResponseToSatisfactionWithProduct'), 600)
        self.assertEqual(response.data.get('percentageValueOfSatisfactoryDeliveries'), 14.3)
        self.assertEqual(response.data.get('percentageValueOfUnsatisfactoryDeliveries'), 57.1)
        self.assertEqual(response.data.get('percentageValueOfNonResponseToSatisfactionWithProduct'), 28.6)

    @classmethod
    def setup_responses(cls):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        questions, options = seed_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=10, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['SATISFIED']
        )
        end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=20, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['SATISFIED']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                  track=True, quantity=30, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['NOT_SATISFIED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                 track=True, quantity=40, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['NOT_SATISFIED']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                 track=True, quantity=50, item=po_item)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['SATISFACTION_WITH_PRODUCT'],
            value=options['NOT_SATISFIED']
        )

        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER,
                                                track=True, quantity=60, item=po_item)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)
