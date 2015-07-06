from unittest import TestCase
from django.db import IntegrityError
from eums.models import ReleaseOrderItem, DistributionPlan, DistributionPlanNode, Programme
from eums.models.release_order import ReleaseOrder
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class ReleaseOrderTest(TestCase):

    def tearDown(self):
        ReleaseOrderItem.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        DistributionPlanNode.objects.all().delete()
        DistributionPlan.objects.all().delete()
        Programme.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_order = [field for field in ReleaseOrder._meta._name_map]

        self.assertEquals(len(ReleaseOrder._meta.fields), 7)

        for field in ['order_number', 'waybill', 'delivery_date', 'sales_order_id', 'purchase_order_id', 'consignee_id']:
            self.assertIn(field, fields_in_order)

    def test_no_two_release_orders_should_have_the_same_order_number(self):
        create_release_order = lambda: ReleaseOrderFactory(order_number=1234)
        create_release_order()
        self.assertRaises(IntegrityError, create_release_order)

    def test_should_get_correct_delivery_if_exists(self):
        create_release_order = lambda: ReleaseOrderFactory(order_number=2342)
        release_order = create_release_order()

        create_release_order_item = lambda: ReleaseOrderItemFactory(release_order = release_order)
        release_order_item = create_release_order_item()

        create_delivery = lambda: DistributionPlanFactory(id = 343)
        delivery = create_delivery()

        create_delivery_node = lambda: DistributionPlanNodeFactory(distribution_plan = delivery, item = release_order_item)
        create_delivery_node()

        returned_release_order = ReleaseOrder.objects.get(order_number=2342)
        self.assertEqual(returned_release_order.delivery(), delivery.id)

    def test_should_return_null_delivery_if_it_doesnt_exist(self):
        create_release_order = lambda: ReleaseOrderFactory(order_number=2342)
        release_order = create_release_order()

        create_release_order_item = lambda: ReleaseOrderItemFactory(release_order = release_order)
        create_release_order_item()

        returned_release_order = ReleaseOrder.objects.get(order_number=2342)
        self.assertEqual(returned_release_order.delivery(), None)

    def test_should_get_orders__as_a_queryset__whose_items_have_been_delivered_to_a_specific_consignee(self):
        consignee = ConsigneeFactory()
        order_one = ReleaseOrderFactory()
        order_two = ReleaseOrderFactory()
        order_three = ReleaseOrderFactory()
        order_item_one = ReleaseOrderItemFactory(release_order=order_one)
        order_item_two = ReleaseOrderItemFactory(release_order=order_two)
        DistributionPlanNodeFactory(item=order_item_one, consignee=consignee)
        DistributionPlanNodeFactory(item=order_item_two, consignee=consignee)

        consignee_orders = ReleaseOrder.objects.for_consignee(consignee.id).order_by('id')

        self.assertListEqual(list(consignee_orders), [order_one, order_two])
        self.assertNotIn(order_three, consignee_orders)