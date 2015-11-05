import datetime
from eums.models import Run, MultipleChoiceQuestion, MultipleChoiceAnswer
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDate

ENDPOINT_URL = BACKEND_URL + 'latest_deliveries/'


class IpDeliveryMapStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryMapStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL + '?treePosition=IMPLEMENTING_PARTNER&location=someLocation&number=3')
        expected_stats = [
            {'deliveryName': 'someLocation on 28-Sep-2014', 'received': True, 'inGoodCondition': True,
             'satisfied': True}, {'deliveryName': 'someLocation on 25-Sep-2014', 'received': False, 'inGoodCondition': False,
             'satisfied': False}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()
        MultipleChoiceAnswer.objects.all().delete()
        from eums.fixtures.ip_questions import seed_ip_questions
        questions, options, _ = seed_ip_questions()

        self.programme = ProgrammeFactory(name='my-program')
        self.ip = ConsigneeFactory()

        self.today = FakeDate.today()
        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        ip_delivery_one = DeliveryFactory(
            location='someLocation',
            track=True,
            programme=self.programme,
            consignee=self.ip,
            ip=self.ip,
            delivery_date=self.today + datetime.timedelta(days=3))

        DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, quantity=10,
                            item=po_item, distribution_plan=ip_delivery_one)

        other_delivery = DeliveryFactory(
            location='someLocation',
            delivery_date=self.today,
            track=True)
        DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, quantity=20,
                            item=po_item, distribution_plan=other_delivery)

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=ip_delivery_one, status=Run.STATUS.scheduled),
            question=questions['WAS_DELIVERY_RECEIVED'], value=options['DELIVERY_WAS_RECEIVED'])

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=ip_delivery_one, status=Run.STATUS.scheduled),
            question=questions['IS_DELIVERY_IN_GOOD_ORDER'], value=options['IN_GOOD_CONDITION'])

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=ip_delivery_one, status=Run.STATUS.scheduled),
            question=questions['SATISFIED_WITH_DELIVERY'], value=options['SATISFIED'])

        non_response_delivery_one = DeliveryFactory(
            delivery_date=self.today + datetime.timedelta(days=4),
            location='someLocation',
            track=True)

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=other_delivery, status=Run.STATUS.scheduled),
            question=questions['WAS_DELIVERY_RECEIVED'], value=options['DELIVERY_WAS_NOT_RECEIVED'])

        DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, quantity=30,
                            item=po_item, distribution_plan=non_response_delivery_one)

        RunFactory(runnable=non_response_delivery_one, status=Run.STATUS.scheduled)
