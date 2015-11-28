from unittest import TestCase
from django.db import IntegrityError
from eums.models import ReleaseOrderItem, DistributionPlan, DistributionPlanNode, Programme
from eums.models.release_order import ReleaseOrder
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class ReleaseOrderTest(TestCase):
    def tearDown(self):
        ReleaseOrderItem.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        DistributionPlanNode.objects.all().delete()
        DistributionPlan.objects.all().delete()
        Programme.objects.all().delete()

    def test_no_two_release_orders_should_have_the_same_order_number(self):
        create_release_order = lambda: ReleaseOrderFactory(order_number=1234)
        create_release_order()
        self.assertRaises(IntegrityError, create_release_order)

    def test_should_get_correct_delivery_if_exists(self):
        release_order = ReleaseOrderFactory(order_number=2342)
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        delivery = DeliveryFactory()

        DeliveryNodeFactory(distribution_plan=delivery, item=release_order_item)

        self.assertEqual(release_order.delivery(), delivery.id)

    def test_should_get_correct_track_status_when_no_delivery_or_delivery_is_not_tracked(self):
        release_order = ReleaseOrderFactory(order_number=2342)
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        self.assertEqual(release_order.track(), None)

        delivery = DeliveryFactory(track=False)
        DeliveryNodeFactory(distribution_plan=delivery, item=release_order_item, track=False)
        self.assertEqual(release_order.track(), False)

    def test_should_get_correct_track_status_when_delivery_is_tracked(self):
        release_order = ReleaseOrderFactory(order_number=2342)
        release_order_item = ReleaseOrderItemFactory(release_order=release_order)
        delivery = DeliveryFactory(track=True)
        DeliveryNodeFactory(distribution_plan=delivery, item=release_order_item, track=True)
        self.assertEqual(release_order.track(), True)

    def test_should_return_none_if_release_order_does_not_have_delivery(self):
        release_order = ReleaseOrderFactory(order_number=2342)
        ReleaseOrderItemFactory(release_order=release_order)

        self.assertEqual(release_order.delivery(), None)

    def test_should_get_orders__as_a_queryset__whose_items_have_been_delivered_to_a_specific_consignee(self):
        consignee = ConsigneeFactory()
        order_one = ReleaseOrderFactory()
        order_two = ReleaseOrderFactory()
        order_three = ReleaseOrderFactory()
        order_item_one = ReleaseOrderItemFactory(release_order=order_one)
        order_item_two = ReleaseOrderItemFactory(release_order=order_two)
        DeliveryNodeFactory(item=order_item_one, consignee=consignee)
        DeliveryNodeFactory(item=order_item_two, consignee=consignee)

        consignee_orders = ReleaseOrder.objects.for_consignee(consignee.id).order_by('id')

        self.assertListEqual(list(consignee_orders), [order_one, order_two])
        self.assertNotIn(order_three, consignee_orders)

    def test_should_get_orders__as_a_queryset__which_have_deliveries(self):
        order_one = ReleaseOrderFactory()
        order_two = ReleaseOrderFactory()
        order_three = ReleaseOrderFactory()
        order_item_one = ReleaseOrderItemFactory(release_order=order_one)
        order_item_two = ReleaseOrderItemFactory(release_order=order_two)
        DeliveryNodeFactory(item=order_item_one)
        DeliveryNodeFactory(item=order_item_two)

        delivered_orders = ReleaseOrder.objects.delivered().order_by('id')

        self.assertListEqual(list(delivered_orders), [order_one, order_two])
        self.assertNotIn(order_three, delivered_orders)
