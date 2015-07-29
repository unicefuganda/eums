from eums.models import PurchaseOrderItem
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'purchase-order-item/'


class PurchaseOrderItemEndPointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(PurchaseOrderItemEndPointTest, self).setUp()
        PurchaseOrderItem.objects.all().delete()

    def test_should_filter_purchase_order_items_by_consignee_and_purchase_order(self):
        po_item = PurchaseOrderItemFactory()
        PurchaseOrderItemFactory()
        consignee = ConsigneeFactory()
        DeliveryNodeFactory(item=po_item, consignee=consignee)
        response = self.client.get('%s?consignee=%d&purchase_order=%d' %
                                   (ENDPOINT_URL, consignee.id, po_item.purchase_order_id))
        self.assertEqual(PurchaseOrderItem.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertDictContainsSubset({'id': po_item.id}, response.data[0])
