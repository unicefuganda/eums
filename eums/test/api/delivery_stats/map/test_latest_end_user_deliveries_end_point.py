import datetime
from eums.models import Run, MultipleChoiceQuestion, MultipleChoiceAnswer, Item
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDate

ENDPOINT_URL = BACKEND_URL + 'latest-deliveries/'


class IpDeliveryMapStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryMapStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL + '?treePosition=END_USER&location=someLocation&limit=3')
        expected_stats = [
            {'name': 'desc_one', 'amountSent': 6, 'productReceived': True, 'amountReceived': '4',
             'qualityOfProduct': 'Damaged'},
            {'name': 'desc_two', 'amountSent': 9, 'productReceived': False},
            {'name': 'desc_three', 'amountSent': 10, 'productReceived': False}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        from eums.fixtures.end_user_questions import seed_questions
        questions, options = seed_questions()

        self.programme = ProgrammeFactory(name='my-program')

        distribution_plan = DeliveryFactory(programme=self.programme, track=True,
                                            location='someLocation')

        item_one = ItemFactory(description='desc_one', material_code='code_one')
        item_two = ItemFactory(description='desc_two', material_code='code_two')
        item_three = ItemFactory(description='desc_three', material_code='code_three')

        po_item_one = PurchaseOrderItemFactory(quantity=100, value=1000, item=item_one)
        po_item_two = PurchaseOrderItemFactory(quantity=100, value=1000, item=item_two)
        po_item_three = PurchaseOrderItemFactory(quantity=100, value=1000, item=item_three)

        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=6,
                                                location='someLocation', distribution_plan=distribution_plan,
                                                item=po_item_one)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['QUALITY_OF_PRODUCT'],
            value=options['DAMAGED']
        )
        NumericAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['EU_AMOUNT_RECEIVED'], value=4
        )

        self.ip = ConsigneeFactory()

        self.today = FakeDate.today()

        self.end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=9,
                                                     location='someLocation',
                                                     item=po_item_two, distribution_plan=distribution_plan)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=10,
                                                  item=po_item_three,
                                                  location='someLocation',
                                                  distribution_plan=distribution_plan,
                                                  ip=self.ip,
                                                  consignee=self.ip,
                                                  delivery_date=self.today + datetime.timedelta(days=3))
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=40,
                                                 item=po_item_one)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=50,
                                                 item=po_item_one)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=60,
                                                item=po_item_one)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)
