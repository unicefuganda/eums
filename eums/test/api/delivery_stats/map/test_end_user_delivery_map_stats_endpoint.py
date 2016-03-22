import datetime
from decimal import Decimal

from eums.models import MultipleChoiceQuestion, Run
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDate

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/map/'


class EndUserDeliveryMapStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(EndUserDeliveryMapStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL + '?treePosition=END_USER')
        expected_stats = [
            {'deliveries': Decimal('2100.00'), 'location': u'Kampala', 'notReceived': Decimal('1200.00'),
             'hasIssues': 0, 'nonResponse': Decimal('600.00'), 'received': Decimal('300.00'),
             'state': 'map-not-received', 'noIssues': 0}]
        self.assert_delivery_stats(response, expected_stats)

    def test_should_filter_by_programme(self):
        response = self.client.get('%s?programme=%s&treePosition=END_USER' % (ENDPOINT_URL, self.programme.id))

        expected_stats = [
            {'deliveries': Decimal('500.00'), 'location': u'Kampala', 'notReceived': Decimal('300.00'), 'hasIssues': 0,
             'nonResponse': 0, 'received': Decimal('200.00'), 'state': 'map-not-received', 'noIssues': 0}]

        self.assert_delivery_stats(response, expected_stats)

    def test_should_filter_by_ip(self):
        response = self.client.get('%s?ip=%s&treePosition=END_USER' % (ENDPOINT_URL, self.ip.id))

        expected_stats = [
            {'deliveries': Decimal('300.00'), 'location': u'Kampala', 'notReceived': Decimal('300.00'), 'hasIssues': 0,
             'nonResponse': 0, 'received': 0, 'state': 'map-not-received', 'noIssues': 0}]

        self.assert_delivery_stats(response, expected_stats)

    def test_should_filter_by_from_date(self):
        response = self.client.get(
            '%s?from=%s&treePosition=END_USER' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [
            {'deliveries': Decimal('300.00'), 'location': u'Kampala', 'notReceived': Decimal('300.00'), 'hasIssues': 0,
             'nonResponse': 0, 'received': 0, 'state': 'map-not-received', 'noIssues': 0}]

        self.assert_delivery_stats(response, expected_stats)

    def test_should_filter_by_to_date(self):
        response = self.client.get(
            '%s?to=%s&treePosition=END_USER' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [
            {'deliveries': Decimal('1800.00'), 'location': u'Kampala', 'notReceived': Decimal('900.00'), 'hasIssues': 0,
             'nonResponse': Decimal('600.00'), 'received': Decimal('300.00'), 'state': 'map-not-received',
             'noIssues': 0}]

        self.assert_delivery_stats(response, expected_stats)

    def test_should_filter_by_both_ip_and_programme(self):
        response = self.client.get(
            '%s?ip=%s&programme=%s&treePosition=END_USER' % (ENDPOINT_URL, self.ip.id, self.programme.id))

        expected_stats = [
            {'deliveries': Decimal('300.00'), 'location': u'Kampala', 'notReceived': Decimal('300.00'), 'hasIssues': 0,
             'nonResponse': 0, 'received': 0, 'state': 'map-not-received', 'noIssues': 0}]
        self.assert_delivery_stats(response, expected_stats)

        non_existing_ip_id = 22222222
        response = self.client.get(
            '%s?ip=%s&programme=%s&treePosition=END_USER' % (ENDPOINT_URL, non_existing_ip_id, self.programme.id))
        self.assertEquals(0, len(response.data))

        non_existing_programme_id = 33333333
        response = self.client.get(
            '%s?ip=%s&programme=%s&treePosition=END_USER' % (ENDPOINT_URL, self.ip.id, non_existing_programme_id))
        self.assertEquals(0, len(response.data))

    def assert_delivery_stats(self, response, expected_stats):
        self.assertEqual(len(response.data), len(expected_stats))
        for stat in expected_stats:
            self.assertIn(stat, response.data)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()

        from eums.fixtures.end_user_questions import seed_questions
        questions, options = seed_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=10,
                                                item=po_item, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        self.programme = ProgrammeFactory(name='my-program')
        self.ip = ConsigneeFactory()

        distribution_plan = DeliveryFactory(programme=self.programme, track=True)
        self.today = FakeDate.today()

        self.end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=20,
                                                     item=po_item, distribution_plan=distribution_plan,
                                                     track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=self.end_user_node_two, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_RECEIVED']
        )
        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=30,
                                                  item=po_item,
                                                  distribution_plan=distribution_plan,
                                                  ip=self.ip,
                                                  consignee=self.ip,
                                                  delivery_date=self.today + datetime.timedelta(days=3),
                                                  track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_four = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=40,
                                                 item=po_item, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, quantity=50,
                                                 item=po_item, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five, status=Run.STATUS.scheduled),
            question=questions['WAS_PRODUCT_RECEIVED'],
            value=options['PRODUCT_WAS_NOT_RECEIVED']
        )
        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True, quantity=60,
                                                item=po_item)
        RunFactory(runnable=non_response_node, status=Run.STATUS.scheduled)
