import datetime
from eums.models import ReleaseOrder, SalesOrder, PurchaseOrder, Consignee
from eums.test.api.api_test_helpers import create_release_order
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from mock import patch

ENDPOINT_URL = BACKEND_URL + 'release-order/'


class ReleaseOrderEndPointTest(AuthenticatedAPITestCase):
    def test_should_get_release_orders(self):
        sales_order = SalesOrderFactory()
        purchase_order = PurchaseOrderFactory()
        consignee = ConsigneeFactory()

        release_order_details = {'order_number': 232345434, 'delivery_date': '2014-10-05',
                                 'sales_order': sales_order.id, 'purchase_order': purchase_order.id,
                                 'consignee': consignee.id, 'waybill': 234256}

        created_release_order, _ = create_release_order(self, release_order_details=release_order_details)

        self.assertDictContainsSubset(release_order_details, created_release_order)
        self.assertDictContainsSubset({'items': []}, created_release_order)
        self.assertDictContainsSubset({'programme': sales_order.programme.name}, created_release_order)

    @patch('eums.models.release_order.ReleaseOrder.objects.for_consignee')
    def test_should_provide_purchase_orders_that_have_deliveries_for_a_specific_consignee(self, mock_for_consignee):
        consignee_id = u'10'
        order = ReleaseOrderFactory()
        mock_for_consignee.return_value = ReleaseOrder.objects.all()

        response = self.client.get('%s?consignee=%s' % (ENDPOINT_URL, consignee_id))

        mock_for_consignee.assert_called_with(consignee_id)
        self.assertDictContainsSubset({'id': order.id}, response.data[0])

    def test_should_return_release_orders_filtered_by_waybill(self):
        ReleaseOrderFactory()
        order = ReleaseOrderFactory(waybill=12345)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'query=123'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

    def test_should_return_release_orders_filtered_by_date(self):
        ReleaseOrderFactory()
        order = ReleaseOrderFactory(delivery_date=datetime.date(2014, 10, 5))

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'from=2014-10-05&to=2014-10-15'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

    def test_should_return_release_orders_filtered_by_from_or_to_date_separately(self):
        order = ReleaseOrderFactory(delivery_date=datetime.date(2014, 10, 5))

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'from=2014-10-04'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'from=2014-10-10'))

        self.assertEqual(len(response.data), 0)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'to=2014-10-10'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'to=2014-10-04'))

        self.assertEqual(len(response.data), 0)
