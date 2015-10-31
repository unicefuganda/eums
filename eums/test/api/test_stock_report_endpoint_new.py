from eums.models import Runnable
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory


class StockReportEndpointTest(AuthenticatedAPITestCase):

    def test_should_retrieve_stock_report_responses_for_given_outcome(self):
        outcome_one = ProgrammeFactory(name='Outcome One')
        outcome_two = ProgrammeFactory(name='Outcome Two')

        delivery_one = DeliveryFactory(programme=outcome_one)
        delivery_two = DeliveryFactory(programme=outcome_two)

        DeliveryNodeFactory(distribution_plan=delivery_one, tree_position=Runnable.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery_two, tree_position=Runnable.IMPLEMENTING_PARTNER)

        endpoint_url = BACKEND_URL + 'stock-report?outcome=%d' % outcome_two.id
        response = self.client.get(endpoint_url)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['programme'], 'Outcome Two')
