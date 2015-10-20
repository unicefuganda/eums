from eums.fixtures.ip_questions import *
from eums.models import MultipleChoiceQuestion, Run, MultipleChoiceAnswer
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/ip/'


class IpDeliveryStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL)
        self.assert_ip_delivery_stats(response)

    def assert_ip_delivery_stats(self, response):
        expected_stats = [
            {'location': 'some location', 'numberOfDeliveries': 2,  'nonResponse': 1,
             'numberReceived': 1, 'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 1, 'state': 'green' },
            {'location': 'Other location', 'numberOfDeliveries': 1, 'nonResponse': 1,
             'numberReceived': 0, 'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 0, 'state': 'grey'}]

        self.assertEqual(len(response.data), 2)
        self.assertIn(expected_stats[0], response.data)
        self.assertIn(expected_stats[1], response.data)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()
        MultipleChoiceAnswer.objects.all().delete()
        questions, options = seed_ip_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)

        ip_node_one = DeliveryNodeFactory(
            quantity=1000,
            location='some location',
            tree_position=DeliveryNode.IMPLEMENTING_PARTNER,
            track=True)

        ip_node_two = DeliveryNodeFactory(
            quantity=1000,
            location='Other location',
            delivery_date='2014-08-18',
            tree_position=DeliveryNode.IMPLEMENTING_PARTNER,
            track=True)

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=ip_node_one, status=Run.STATUS.scheduled),
            question=questions['WAS_DELIVERY_RECEIVED'], value=options['DELIVERY_WAS_RECEIVED'])

        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=ip_node_one, status=Run.STATUS.scheduled),
            question=questions['IS_DELIVERY_IN_GOOD_ORDER'], value=options['IN_GOOD_CONDITION'])

        non_response_node_one = DeliveryNodeFactory(
            tree_position=DeliveryNode.IMPLEMENTING_PARTNER,
            delivery_date='2014-08-18',
            location='some location',
            track=True,
            item=po_item)

        RunFactory(runnable=non_response_node_one, status=Run.STATUS.scheduled)
