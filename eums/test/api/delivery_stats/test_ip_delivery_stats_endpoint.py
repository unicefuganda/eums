import datetime
from decimal import Decimal

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

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/end-user/'


class IpDeliveryStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_product_received_question_stats(self):
        response = self.client.get('%s?treePosition=IMPLEMENTING_PARTNER' % ENDPOINT_URL)

        expected_response_data = {'percentageValueOfNonResponseToProductReceived': 50.2,
                                  'percentageOfDeliveriesInBadOrder': 0.0,
                                  'percentageOfNonResponseToQualityOfProduct': 66.7,
                                  'totalValueOfDeliveriesInBadOrder': 0,
                                  'percentageValueOfSatisfactoryDeliveries': 0.0,
                                  'totalValueOfNonResponseToProductReceived': Decimal('10100.00'),
                                  'percentageValueOfUnsuccessfulDeliveries': 0.0,
                                  'percentageValueOfSuccessfulDeliveries': 49.8,
                                  'totalValueOfNonResponseToQualityOfProduct': Decimal('10100.00'),
                                  'percentageValueOfUnsatisfactoryDeliveries': 0.0,
                                  'numberOfNonResponseToSatisfactionWithProduct': 3,
                                  'percentageOfUnsuccessfulDeliveries': 0.0,
                                  'totalValueOfNonResponseToSatisfactionWithProduct': Decimal('20100.00'),
                                  'percentageValueOfDeliveriesInGoodOrder': 49.8,
                                  'totalValueOfDeliveriesInGoodOrder': Decimal('10000.00'),
                                  'totalValueOfSatisfactoryDeliveries': 0, 'numberOfNonResponseToProductReceived': 2,
                                  'percentageValueOfNonResponseToSatisfactionWithProduct': 100.0,
                                  'numberOfNonResponseToQualityOfProduct': 2,
                                  'totalValueOfSuccessfulDeliveries': Decimal('10000.00'), 'totalNumberOfDeliveries': 3,
                                  'numberOfDeliveriesInBadOrder': 0,
                                  'percentageValueOfNonResponseToQualityOfProduct': 50.2,
                                  'numberOfUnsuccessfulProductDeliveries': 0,
                                  'totalValueOfUnsuccessfulProductDeliveries': 0,
                                  'percentageOfNonResponseToProductReceived': 66.7,
                                  'totalValueOfDeliveries': Decimal('20100.00'),
                                  'percentageOfSuccessfulDeliveries': 33.3, 'numberOfSatisfactoryDeliveries': 0,
                                  'totalValueOfUnsatisfactoryDeliveries': 0, 'percentageOfDeliveriesInGoodOrder': 33.3,
                                  'percentageOfUnsatisfactoryDeliveries': 0.0, 'numberOfSuccessfulProductDeliveries': 1,
                                  'percentageValueOfDeliveriesInBadOrder': 0.0, 'numberOfUnsatisfactoryDeliveries': 0,
                                  'percentageOfNonResponseToSatisfactionWithProduct': 100.0,
                                  'percentageOfSatisfactoryDeliveries': 0.0,
                                  'numberOfDeliveriesInGoodOrder': 1}

        self.assertEqual(response.data, expected_response_data)

    def test_should_filter_stats_by_programme(self):
        response = self.client.get(
            '%s?treePosition=IMPLEMENTING_PARTNER&programme=%s' % (ENDPOINT_URL, self.programme.id))
        self.assertEqual(response.data['totalNumberOfDeliveries'], 1)

    def test_should_filter_stats_from_given_date(self):
        response = self.client.get(
            '%s?treePosition=IMPLEMENTING_PARTNER&from=%s' % (ENDPOINT_URL, self.today + datetime.timedelta(days=3)))
        self.assertEqual(response.data['totalNumberOfDeliveries'], 2)

    def test_should_filter_stats_before_given_date(self):
        response = self.client.get(
            '%s?treePosition=IMPLEMENTING_PARTNER&to=%s' % (ENDPOINT_URL, self.today))
        self.assertEqual(response.data['totalNumberOfDeliveries'], 1)

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
