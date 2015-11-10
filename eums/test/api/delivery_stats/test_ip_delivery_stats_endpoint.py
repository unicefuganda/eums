import datetime

from eums.models import MultipleChoiceQuestion, Run, MultipleChoiceAnswer
from eums.test.api.delivery_stats.delivery_stats_test_case import DeliveryStatsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDate

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/details/'


class IpDeliveryStatsEndPointTest(DeliveryStatsTestCase):
    def setUp(self):
        super(IpDeliveryStatsEndPointTest, self).setUp()
        self.other_ip = ConsigneeFactory()
        self.setup_responses()

    def test_should_product_received_question_stats(self):
        response = self.client.get('%s?treePosition=IMPLEMENTING_PARTNER' % ENDPOINT_URL)

        expected_response_data = {'percentageOfDeliveriesInBadOrder': 0.0,
                                  'percentageValueOfSatisfactoryDeliveries': 0.0,
                                  'totalValueOfSatisfactoryDeliveries': 0, 'numberOfNonResponseToQualityOfProduct': 2,
                                  'totalValueOfSuccessfulDeliveries': 0,
                                  'numberOfNonResponseToSatisfactionWithProduct': 3,
                                  'percentageValueOfAwaitingResponseToProductReceived': 0.0,
                                  'numberOfAwaitingResponseToProductReceived': 0, 'numberOfUnsatisfactoryDeliveries': 0,
                                  'percentageValueOfAwaitingResponseToSatisfactionWithProduct': 0.0,
                                  'totalValueOfNonResponseToQualityOfProduct': 0,
                                  'percentageValueOfDeliveriesInGoodOrder': 0.0,
                                  'numberOfAwaitingResponseToQualityOfProduct': 0, 'totalNumberOfDeliveries': 3,
                                  'percentageValueOfNonResponseToQualityOfProduct': 0.0,
                                  'numberOfUnsuccessfulProductDeliveries': 0,
                                  'totalValueOfUnsuccessfulProductDeliveries': 0,
                                  'percentageOfNonResponseToProductReceived': 66.7,
                                  'totalValueOfNonResponseToSatisfactionWithProduct': 0,
                                  'percentageValueOfAwaitingResponseToQualityOfProduct': 0.0,
                                  'numberOfSuccessfulProductDeliveries': 1,
                                  'percentageOfAwaitingResponseToSatisfactionWithProduct': 0.0,
                                  'percentageOfNonResponseToSatisfactionWithProduct': 100.0,
                                  'totalValueOfDeliveriesInBadOrder': 0,
                                  'totalValueOfAwaitingResponseToQualityOfProduct': 0,
                                  'totalValueOfNonResponseToProductReceived': 0, 'numberOfSatisfactoryDeliveries': 0,
                                  'percentageValueOfSuccessfulDeliveries': 0.0,
                                  'percentageOfAwaitingResponseToQualityOfProduct': 0.0,
                                  'percentageValueOfUnsatisfactoryDeliveries': 0.0,
                                  'percentageOfUnsuccessfulDeliveries': 0.0, 'totalValueOfDeliveriesInGoodOrder': 0,
                                  'numberOfNonResponseToProductReceived': 2,
                                  'percentageOfUnsatisfactoryDeliveries': 0.0, 'totalValueOfDeliveries': 0,
                                  'percentageOfDeliveriesInGoodOrder': 33.3, 'numberOfDeliveriesInGoodOrder': 1,
                                  'percentageValueOfNonResponseToProductReceived': 0.0,
                                  'percentageOfSatisfactoryDeliveries': 0.0,
                                  'percentageValueOfDeliveriesInBadOrder': 0.0,
                                  'percentageValueOfNonResponseToSatisfactionWithProduct': 0.0,
                                  'totalValueOfAwaitingResponseToSatisfactionWithProduct': 0,
                                  'numberOfAwaitingResponseToSatisfactionWithProduct': 0,
                                  'totalValueOfAwaitingResponseToProductReceived': 0, 'numberOfDeliveriesInBadOrder': 0,
                                  'percentageOfAwaitingResponseToProductReceived': 0.0,
                                  'percentageValueOfUnsuccessfulDeliveries': 0.0,
                                  'percentageOfSuccessfulDeliveries': 33.3, 'totalValueOfUnsatisfactoryDeliveries': 0,
                                  'percentageOfNonResponseToQualityOfProduct': 66.7}

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

        self.programme = ProgrammeFactory(name='my-program')
        self.ip = ConsigneeFactory()

        self.today = FakeDate.today()
        ip_delivery_one = DeliveryFactory(
            location='some location',
            track=True,
            programme=self.programme,
            consignee=self.ip,
            ip=self.ip,
            delivery_date=self.today + datetime.timedelta(days=3))

        DeliveryFactory(
            location='Other location',
            delivery_date=self.today,
            track=True)

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

        RunFactory(runnable=non_response_delivery_one, status=Run.STATUS.scheduled)
