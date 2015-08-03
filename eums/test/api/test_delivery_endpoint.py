import datetime

from eums.models import DistributionPlan as Delivery, Programme, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.distribution_plan_node_factory import DeliveryNodeFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DeliveryEndPointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(DeliveryEndPointTest, self).setUp()
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def test_should_create_delivery(self):
        today = datetime.date.today()
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme, date=today)
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], delivery.id)

    def test_should_provide_delivery_total_value_from_api(self):
        po_item = PurchaseOrderItemFactory(value=200, quantity=100)
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item, quantity=10)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.data[0]['total_value'], 20)

    def test_should_filter_deliveries_by_programme(self):
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme)
        DeliveryFactory()

        response = self.client.get('%s?programme=%d' % (ENDPOINT_URL, programme.id))

        self.assertEqual(Delivery.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], delivery.id)

    def clean_up(self):
        Programme.objects.all().delete()
        Consignee.objects.all().delete()
