import datetime
from httplib import FORBIDDEN
from httplib import OK

from mock import patch

from eums.models import ReleaseOrder
from eums.test.api.api_test_helpers import create_release_order
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory

ENDPOINT_URL = '%srelease-order/' % BACKEND_URL


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

    def test_should_return_release_orders_by_multi_search_fields(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'waybill=234256&'
                                                            'itemDescription=HEK2013&'
                                                            'fromDate=2014-10-04&'
                                                            'toDate=2014-10-06&'
                                                            'programmeId=%s&'
                                                            'selectedLocation=Wakiso&'
                                                            'ipId=%s' % (programme.id, consignee.id)))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_date_range(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'fromDate=2014-10-04&'
                                                            'toDate=2014-10-06'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_waybill_number(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'waybill=234256'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_item_description(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'itemDescription=HEK2013'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_programme_id(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'programmeId=%s' % programme.id))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_location(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'selectedLocation=Wakiso'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_ip(self):
        ro_one, ro_tow, programme, consignee = self.create_release_orders()
        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'ipId=%s' % consignee.id))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], ro_tow.id)

    def test_should_return_release_orders_filtered_by_from_or_to_date_separately(self):
        order = ReleaseOrderFactory(delivery_date=datetime.date(2014, 10, 5))

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'fromDate=2014-10-04'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'fromDate=2014-10-10'))

        self.assertEqual(len(response.data), 0)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'toDate=2014-10-10'))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'toDate=2014-10-04'))

        self.assertEqual(len(response.data), 0)

    def test_unicef_admin_should_have_permission_to_view_release_orders(self):
        self.log_and_assert_permission(self.log_unicef_admin_in, OK)

    def test_unicef_editor_should_have_permission_to_view_release_orders(self):
        self.log_and_assert_permission(self.log_unicef_editor_in, OK)

    def test_unicef_viewer_should_have_permission_to_view_release_orders(self):
        self.log_and_assert_permission(self.log_unicef_viewer_in, OK)

    def test_ip_editor_should_not_have_permission_to_view_release_orders(self):
        self.log_and_assert_permission(self.log_ip_editor_in, FORBIDDEN)

    def test_ip_viewer_should_not_have_permission_to_view_release_orders(self):
        self.log_and_assert_permission(self.log_ip_viewer_in, FORBIDDEN)

    def log_and_assert_permission(self, log_func, status_code):
        self.logout()
        log_func()
        self.assertEqual(self.client.get(ENDPOINT_URL).status_code, status_code)

    def create_release_orders(self):
        programme = ProgrammeFactory(name='YP104 MANAGEMENT RESULTS')
        sales_order = SalesOrderFactory(programme=programme)
        consignee = ConsigneeFactory()
        date = datetime.date(2014, 10, 05)
        purchase_order = PurchaseOrderFactory()

        ro_one = ReleaseOrderFactory(waybill=45143984)
        ro_two = ReleaseOrderFactory(waybill=234256,
                                     sales_order=sales_order,
                                     purchase_order=purchase_order,
                                     delivery_date=date)
        ro_item = ReleaseOrderItemFactory(release_order=ro_two, item=ItemFactory(description="HEK2013"))
        distribution_plan = DeliveryFactory()
        DeliveryNodeFactory(item=ro_item,
                            distribution_plan=distribution_plan,
                            location="Wakiso",
                            consignee=consignee)
        return ro_one, ro_two, programme, consignee
