import datetime

from eums.models import DistributionPlan, Programme, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.programme_factory import ProgrammeFactory

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(DistributionPlanEndPointTest, self).setUp()
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def test_should_create_delivery(self):
        today = datetime.date.today()
        programme = ProgrammeFactory()
        delivery = DistributionPlanFactory(programme=programme, date=today)
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], delivery.id)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        Programme.objects.all().delete()
        Consignee.objects.all().delete()
