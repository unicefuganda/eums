import datetime

from eums.api.delivery_stats.ip_delivery_stats_endpoint import DeliveryState
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

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/ip/'


class IpDeliveryMapStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryMapStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_return_correct_json_object(self):
        response = self.client.get(ENDPOINT_URL)
        expected_stats = [{'location': 'some location', 'numberOfDeliveries': 2, 'nonResponse': 1, 'numberReceived': 1,
                           'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 1, 'state': 'green'},
                          {'location': 'Other location', 'numberOfDeliveries': 1, 'nonResponse': 1, 'numberReceived': 0,
                           'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 0, 'state': 'grey'}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_programme(self):
        response = self.client.get('%s?programme=%s' % (ENDPOINT_URL, self.programme.id))

        expected_stats = [{'location': 'some location', 'numberOfDeliveries': 1, 'nonResponse': 0,
                           'numberReceived': 1, 'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 1,
                           'state': 'green'}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_ip(self):
        response = self.client.get('%s?ip=%s' % (ENDPOINT_URL, self.ip.id))

        expected_stats = [{'location': 'some location', 'numberOfDeliveries': 1, 'nonResponse': 0,
                           'numberReceived': 1, 'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 1,
                           'state': 'green'}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_from_date(self):
        response = self.client.get('%s?from=%s' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [{'numberOfDeliveries': 2, 'location': 'some location', 'numberNotReceived': 0, 'hasIssues': 0,
                           'nonResponse': 1, 'numberReceived': 1, 'state': 'green', 'noIssues': 1}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_to_date(self):
        response = self.client.get('%s?to=%s' % (ENDPOINT_URL, self.today + datetime.timedelta(days=2)))

        expected_stats = [{'numberOfDeliveries': 1, 'location': 'Other location', 'numberNotReceived': 0,
                           'hasIssues': 0, 'nonResponse': 1, 'numberReceived': 0, 'state': 'grey', 'noIssues': 0}]
        self.assert_ip_delivery_stats(response, expected_stats)

    def test_should_filter_by_both_ip_and_programme(self):
        response = self.client.get('%s?ip=%s&programme=%s' % (ENDPOINT_URL, self.ip.id, self.programme.id))

        expected_stats = [{'location': 'some location', 'numberOfDeliveries': 1, 'nonResponse': 0, 'numberReceived': 1,
                           'numberNotReceived': 0, 'hasIssues': 0, 'noIssues': 1, 'state': 'green'}]
        self.assert_ip_delivery_stats(response, expected_stats)

        non_existing_ip_id = 22222222
        response = self.client.get('%s?ip=%s&programme=%s' % (ENDPOINT_URL, non_existing_ip_id, self.programme.id))
        self.assertEquals(0, len(response.data))

        non_existing_programme_id = 33333333
        response = self.client.get('%s?ip=%s&programme=%s' % (ENDPOINT_URL, self.ip.id, non_existing_programme_id))
        self.assertEquals(0, len(response.data))

    def assert_ip_delivery_stats(self, response, expected_stats):
        self.assertEqual(len(response.data), len(expected_stats))
        for stat in expected_stats:
            self.assertIn(stat, response.data)

    def test_should_return_yellow_when_number_of_deliveries_is_zero(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 0})
        self.assertEqual('yellow', state)

    def test_should_return_grey_when_non_responce_percentage_is_greater_than_X(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 10, 'nonResponse': 8})
        self.assertEqual('grey', state)

    def test_should_return_red_if_not_received_is_more_than_received(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 10, 'nonResponse': 6, 'numberNotReceived': 3,
                                         'numberReceived': 1})
        self.assertEqual('red', state)

    def test_should_return_green_if_more_deliveries_are_in_good_condition(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 10, 'nonResponse': 2, 'numberNotReceived': 1,
                                         'numberReceived': 6, 'hasIssues': 1, 'noIssues': 5})
        self.assertEqual('green', state)

    def test_should_return_green_if_has_issues_is_zero(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 10, 'nonResponse': 2, 'numberNotReceived': 0,
                                         'numberReceived': 0, 'hasIssues': 0, 'noIssues': 0})
        self.assertEqual('green', state)

    def test_should_return_orange_if_no_issues_less_or_equal_to_has_issues(self):
        state = DeliveryState.get_state({'numberOfDeliveries': 10, 'nonResponse': 2, 'numberNotReceived': 0,
                                         'numberReceived': 4, 'hasIssues': 3, 'noIssues': 1})
        self.assertEqual('orange', state)

    def setup_responses(self):
        DeliveryNode.objects.all().delete()
        MultipleChoiceQuestion.objects.all().delete()
        MultipleChoiceAnswer.objects.all().delete()
        from eums.fixtures.ip_questions import seed_ip_questions
        questions, options, _ = seed_ip_questions()

        po_item = PurchaseOrderItemFactory(quantity=100, value=1000)

        self.programme = ProgrammeFactory(name='my-program')
        self.ip = ConsigneeFactory()

        distribution_plan = DeliveryFactory(programme=self.programme)

        self.today = FakeDate.today()
        ip_node_one = DeliveryNodeFactory(
            quantity=1000,
            location='some location',
            tree_position=DeliveryNode.IMPLEMENTING_PARTNER,
            track=True,
            distribution_plan=distribution_plan,
            consignee=self.ip,
            delivery_date=self.today + datetime.timedelta(days=3))

        ip_node_two = DeliveryNodeFactory(
            quantity=1000,
            location='Other location',
            delivery_date=self.today,
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
            delivery_date=self.today + datetime.timedelta(days=4),
            location='some location',
            track=True,
            item=po_item)

        RunFactory(runnable=non_response_node_one, status=Run.STATUS.scheduled)
