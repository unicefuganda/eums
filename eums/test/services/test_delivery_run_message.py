from unittest import TestCase
from eums.services.delivery_run_message import DeliveryRunMessage
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class DeliveryRunMessageTest(TestCase):

    def test_should_return_description_of_release_order_item_with_waybill_and_order_number(self):
        release_order = ReleaseOrderFactory(waybill=444555888)
        item = ReleaseOrderItemFactory(release_order=release_order)
        delivery = DistributionPlanFactory()
        DistributionPlanNodeFactory(distribution_plan=delivery, item=item)

        message = DeliveryRunMessage(delivery)

        self.assertRegexpMatches(message.description(), r'Waybill')
        self.assertRegexpMatches(message.description(), r'444555888')

    def test_should_return_description_of_purchase_order_item_with_purchase_order_and_order_number(self):
        purchase_order = PurchaseOrderFactory(order_number=222333444)
        item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        delivery = DistributionPlanFactory()
        DistributionPlanNodeFactory(distribution_plan=delivery, item=item)

        message = DeliveryRunMessage(delivery)

        self.assertRegexpMatches(message.description(), r'Purchase Order')
        self.assertRegexpMatches(message.description(), r'222333444')

    def test_should_return_description_of_the_item_when_runnable_is_delivery_node(self):
        item = ItemFactory(description='go gunners')
        order_item = PurchaseOrderItemFactory(item=item)
        node = DistributionPlanNodeFactory(item=order_item)

        message = DeliveryRunMessage(node)

        self.assertEqual(message.description(), 'go gunners')
