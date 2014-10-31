from eums.models import ReleaseOrder
from eums.test.api.api_test_helpers import create_release_order
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory


ENDPOINT_URL = BACKEND_URL + 'release-order/'


class ReleaseOrderEndPointTest(AuthenticatedAPITestCase):
    def tearDown(self):
        ReleaseOrder.objects.all().delete()

    def test_should_get_release_orders(self):
        sales_order = SalesOrderFactory()
        consignee = ConsigneeFactory()

        release_order_details = {'order_number': "232345434", 'delivery_date': '2014-10-05',
                                 'sales_order': sales_order.id, 'consignee': consignee.id, 'waybill': '234256'}

        created_release_order = create_release_order(self, release_order_details=release_order_details)

        self.assertDictContainsSubset(release_order_details, created_release_order)
        self.assertDictContainsSubset({'releaseorderitem_set': []}, created_release_order)
