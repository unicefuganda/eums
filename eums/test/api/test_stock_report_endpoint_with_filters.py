import datetime
from eums.models import Runnable, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class StockReportEndpointWithFiltersTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(StockReportEndpointWithFiltersTest, self).setUp()
        self.setup_flow()

    def test_should_filter_based_on_outcome(self):
        outcome_one = ProgrammeFactory(name='Outcome One')
        outcome_two = ProgrammeFactory(name='Outcome Two')

        delivery_one = DeliveryFactory(programme=outcome_one)
        delivery_two = DeliveryFactory(programme=outcome_two)

        DeliveryNodeFactory(distribution_plan=delivery_one, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery_two, tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?outcome=%d' % outcome_two.id
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['programme'], 'Outcome Two')
        self.assertEqual(len(results[0]['items']), 1)

    def test_should_filter_based_on_outcome_and_ip(self):
        outcome_one = ProgrammeFactory(name='Outcome One')
        outcome_two = ProgrammeFactory(name='Outcome Two')

        consignee_one = ConsigneeFactory(name="Consignee One", type=Consignee.TYPES.implementing_partner)
        consignee_two = ConsigneeFactory(name="Consignee Two", type=Consignee.TYPES.implementing_partner)

        delivery_one = DeliveryFactory(programme=outcome_one)
        delivery_two = DeliveryFactory(programme=outcome_two)

        DeliveryNodeFactory(
            distribution_plan=delivery_one,
            consignee=consignee_one,
            tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        DeliveryNodeFactory(
            distribution_plan=delivery_two,
            consignee=consignee_one,
            tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        DeliveryNodeFactory(
            distribution_plan=delivery_two,
            consignee=consignee_two,
            tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?consignee=%d&outcome=%d' % (consignee_one.id, outcome_two.id)
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['programme'], 'Outcome Two')
        self.assertEqual(len(results[0]['items']), 1)
        self.assertEqual(results[0]['items'][0]['consignee'], 'Consignee One')

    def test_should_filter_based_on_from_date(self):
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 10, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 11, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?fromDate=2015-10-15'
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['last_shipment_date'], '2015-11-01')

    def test_should_return_no_results_when_from_date_greater_than_all_dates_on_nodes(self):
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 10, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 11, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?fromDate=2015-11-15'
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 0)

    def test_should_filter_based_on_to_date(self):
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 10, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 11, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?toDate=2015-10-15'
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['last_shipment_date'], '2015-10-01')

    def test_should_return_no_results_when_to_date_less_than_all_dates_on_nodes(self):
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 10, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(delivery_date=datetime.date(2015, 11, 1), tree_position=Flow.Label.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?toDate=2015-09-01'
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 0)

    def setup_flow(self):
        self.ip_flow = FlowFactory(label=Flow.Label.IMPLEMENTING_PARTNER)
