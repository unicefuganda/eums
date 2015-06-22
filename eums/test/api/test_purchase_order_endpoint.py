from mock import patch
from eums.models import PurchaseOrder, Programme
from eums.test.api.api_test_helpers import create_purchase_order, create_release_order
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory

ENDPOINT_URL = BACKEND_URL + 'purchase-order/'


class PurchaseOrderEndPointTest(AuthenticatedAPITestCase):
    def setUp(self):
        PurchaseOrder.objects.all().delete()

    def tearDown(self):
        PurchaseOrder.objects.all().delete()
        Programme.objects.all().delete()

    def test_should_get_purchase_orders_without_release_orders(self):
        created_purchase_order = create_purchase_order(self)
        create_release_order(self)

        response = self.client.get(ENDPOINT_URL+'for_direct_delivery/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data, [created_purchase_order])
        self.assertDictContainsSubset(created_purchase_order, response.data[0])

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_fetched_purchase_orders_should_have_programme_name_and_programme_id(self):
        programme = ProgrammeFactory()
        purchase_order = PurchaseOrderFactory(sales_order=SalesOrderFactory(programme=programme))
        response = self.client.get('%s%s/' % (ENDPOINT_URL, purchase_order.id))
        self.assertDictContainsSubset({'programme': programme.id, 'programme_name': programme.name}, response.data)

    @patch('eums.models.purchase_order.PurchaseOrder.objects.for_consignee')
    def test_should_provide_purchase_orders_that_have_deliveries_for_a_specific_consignee(self, mock_for_consignee):
        consignee_id = u'10'
        order = PurchaseOrderFactory()
        mock_for_consignee.return_value = PurchaseOrder.objects.all()

        response = self.client.get('%s?consignee=%s' % (ENDPOINT_URL, consignee_id))

        mock_for_consignee.assert_called_with(consignee_id)
        self.assertDictContainsSubset({'id': order.id}, response.data[0])
