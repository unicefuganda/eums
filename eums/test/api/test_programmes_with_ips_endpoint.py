from eums.models import DistributionPlanNode, Consignee, Programme, Item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.consignee_factory import ConsigneeFactory

from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'programme/'


class ProgrammesWithIpsEndPointTest(AuthenticatedAPITestCase):

    def test_should_get_programmes_with_associated_ips(self):
        programme = ProgrammeFactory(name='Our Programme')
        delivery = DeliveryFactory(programme=programme)
        kisoro = ConsigneeFactory(name="KISORO")
        wakiso = ConsigneeFactory(name="WAKISO")
        guru = ConsigneeFactory(name="GURU DHO")

        DeliveryNodeFactory(consignee=wakiso, distribution_plan=delivery)
        DeliveryNodeFactory(consignee=guru, distribution_plan=delivery)
        DeliveryNodeFactory(consignee=kisoro, distribution_plan=delivery)

        response = self.client.get(ENDPOINT_URL + 'with-ips/', format='json')

        self.assertEqual(response.status_code, 200)
        expected_response = get_programme(programme, response.data)[0]

        [self.assertIn(ip, expected_response['ips']) for ip in [kisoro.id, wakiso.id, guru.id]]


def get_programme(programme, programmes):
    return filter(lambda prog: prog['id'] == programme.id, programmes)
