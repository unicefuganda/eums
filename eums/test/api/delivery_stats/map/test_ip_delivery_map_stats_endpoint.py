import datetime
from decimal import Decimal

from eums.api.delivery_stats.delivery_stats_map_endpoint import DeliveryState
from eums.models import MultipleChoiceQuestion, Run, MultipleChoiceAnswer
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDate

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/map/'


class IpDeliveryMapStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryMapStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL + '?treePosition=IMPLEMENTING_PARTNER')
        expected_stats = [
            {'location': 'some location', 'deliveries': Decimal('400.00'), 'nonResponse': Decimal('300.00'),
             'received': Decimal('100.00'),
             'notReceived': 0, 'hasIssues': 0, 'noIssues': Decimal('100.00'), 'state': 'map-non-response'},
            {'location': 'Other location', 'deliveries': Decimal('200.00'), 'nonResponse': Decimal('200.00'),
             'received': 0,
             'notReceived': 0, 'hasIssues': 0, 'noIssues': 0, 'state': 'map-non-response'}]

        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_programme(self):
        response = self.client.get(
            '%s?programme=%s&treePosition=IMPLEMENTING_PARTNER' % (ENDPOINT_URL, self.programme.id))

        expected_stats = [
            {'location': 'some location', 'deliveries': Decimal('100.00'), 'nonResponse': 0,
             'received': Decimal('100.00'),
             'notReceived': 0, 'hasIssues': 0, 'noIssues': Decimal('100.00'), 'state': 'map-received'}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_ip(self):
        response = self.client.get('%s?ip=%s&treePosition=IMPLEMENTING_PARTNER' % (ENDPOINT_URL, self.ip.id))

        expected_stats = [
            {'location': 'some location', 'deliveries': Decimal('100.00'), 'nonResponse': 0,
             'received': Decimal('100.00'),
             'notReceived': 0, 'hasIssues': 0, 'noIssues': Decimal('100.00'), 'state': 'map-received'}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_from_date(self):
        response = self.client.get(
            '%s?from=%s&treePosition=IMPLEMENTING_PARTNER' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [{'deliveries': Decimal('400.00'), 'location': 'some location', 'notReceived': 0, 'hasIssues': 0,
                           'nonResponse': Decimal('300.00'), 'received': Decimal('100.00'), 'state': 'map-non-response',
                           'noIssues': Decimal('100.00')}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_to_date(self):
        response = self.client.get(
            '%s?to=%s&treePosition=IMPLEMENTING_PARTNER' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [{'deliveries': Decimal('200.00'), 'location': 'Other location', 'notReceived': 0,
                           'hasIssues': 0, 'nonResponse': Decimal('200.00'), 'received': 0, 'state': 'map-non-response',
                           'noIssues': 0}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_both_ip_and_programme(self):
        response = self.client.get(
            '%s?ip=%s&programme=%s&treePosition=IMPLEMENTING_PARTNER' % (ENDPOINT_URL, self.ip.id, self.programme.id))

        expected_stats = [{'location': 'some location', 'deliveries': Decimal('100.00'), 'nonResponse': 0, 'received': Decimal('100.00'),
                           'notReceived': 0, 'hasIssues': 0, 'noIssues': Decimal('100.00'), 'state': 'map-received'}]
        self.assert_ip_delivery_stats(response, expected_stats)

        non_existing_ip_id = 22222222
        response = self.client.get('%s?ip=%s&programme=%s&treePosition=IMPLEMENTING_PARTNER' % (
            ENDPOINT_URL, non_existing_ip_id, self.programme.id))
        self.assertEquals(0, len(response.data))

        non_existing_programme_id = 33333333
        response = self.client.get('%s?ip=%s&programme=%s&treePosition=IMPLEMENTING_PARTNER' % (
            ENDPOINT_URL, self.ip.id, non_existing_programme_id))
        self.assertEquals(0, len(response.data))

    def test_should_return_yellow_when_number_of_deliveries_is_zero(self):
        state = DeliveryState.get_state({'deliveries': 0, 'nonResponse': 0, 'notReceived': 0,
                                         'received': 0, 'hasIssues': 0, 'noIssues': 0})
        self.assertEqual('map-no-response-expected', state)

    def test_should_return_grey_when_non_responce_percentage_is_greater_than_X(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 8, 'notReceived': 0,
                                         'received': 0, 'hasIssues': 0, 'noIssues': 0})
        self.assertEqual('map-non-response', state)

    def test_should_return_red_if_not_received_is_more_than_received(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 6, 'notReceived': 3,
                                         'received': 1})
        self.assertEqual('map-not-received', state)

    def test_should_return_green_if_more_deliveries_are_in_good_condition(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 2, 'notReceived': 1,
                                         'received': 6, 'hasIssues': 1, 'noIssues': 5})
        self.assertEqual('map-received', state)

    def test_should_return_orange_if_no_issues_less_or_equal_to_has_issues(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 2, 'notReceived': 0,
                                         'received': 4, 'hasIssues': 3, 'noIssues': 1})
        self.assertEqual('map-received-with-issues', state)

    def test_should_return_white_if_non_response_below_threshold_and_no_responses_exist(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 3, 'notReceived': 0,
                                         'received': 0, 'hasIssues': 0, 'noIssues': 0})
        self.assertEqual('map-no-response-expected', state)

    def test_should_return_red_if_received_and_unreceived_is_equal_exist(self):
        state = DeliveryState.get_state({'deliveries': 10, 'nonResponse': 0, 'notReceived': 5,
                                         'received': 5, 'hasIssues': 0, 'noIssues': 0})
        self.assertEqual('map-not-received', state)

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
            location='some location',
            track=True,
            programme=self.programme,
            consignee=self.ip,
            ip=self.ip,
            delivery_date=self.today + datetime.timedelta(days=3))

        DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, quantity=10,
                            item=po_item, distribution_plan=ip_delivery_one, consignee=self.ip)

        other_delivery = DeliveryFactory(
            location='Other location',
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

        non_response_delivery_one = DeliveryFactory(
            delivery_date=self.today + datetime.timedelta(days=4),
            location='some location',
            track=True)

        DeliveryNodeFactory(tree_position=DeliveryNode.IMPLEMENTING_PARTNER, quantity=30,
                            item=po_item, distribution_plan=non_response_delivery_one)

        RunFactory(runnable=non_response_delivery_one, status=Run.STATUS.scheduled)
