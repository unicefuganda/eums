import logging
from unittest import TestCase

from eums.models import ReleaseOrder, DistributionPlan, DistributionPlanNode, ReleaseOrderItem
from eums.services.release_order_to_delivery_service import ReleaseOrderToDeliveryService
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

logger = logging.getLogger(__name__)


class ReleaseOrderToDeliveryServiceTest(TestCase):

    def test_is_release_order_need_sync_should_return_true(self):
        release_order = ReleaseOrderFactory()
        self.assertTrue(ReleaseOrderToDeliveryService.is_release_order_not_sync(release_order))

    def test_is_release_order_need_sync_should_return_false(self):
        release_order = ReleaseOrderFactory()
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        DeliveryNodeFactory(item=release_order_item)
        self.assertFalse(ReleaseOrderToDeliveryService.is_release_order_not_sync(release_order))

    def test_sync_release_order_to_delivery_should_execute(self):
        release_order = ReleaseOrderFactory()
        ReleaseOrderItemFactory(release_order=release_order)
        ReleaseOrderToDeliveryService.sync_release_order_to_delivery(release_order)
        self.assertTrue(len(DistributionPlan.objects.all()) is 1, 'Delivery not exist')
        self.assertTrue(len(DistributionPlanNode.objects.all()) is 1, 'DeliveryNode not exist')
        self.assertEqual(DistributionPlanNode.objects.all().first().item, ReleaseOrderItem.objects.all().first())

    def tearDown(self):
        ReleaseOrder.objects.all().delete()
        DistributionPlan.objects.all().delete()
