from unittest import TestCase

from eums.models import Consignee, Question, ConsigneeItem, \
    PurchaseOrderItem, DistributionPlan
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.consignee_item_factory import ConsigneeItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.delivery_node_loss_factory import DeliveryNodeLossFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class ConsigneeItemTest(TestCase):
    @classmethod
    def tearDownClass(cls):
        PurchaseOrderItem.objects.all().delete()
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def setUp(self):
        PurchaseOrderItem.objects.all().delete()

    def test_should_get_available_balance_of_item_distributed_by_consignee(self):
        consignee = ConsigneeFactory()
        po_item = PurchaseOrderItemFactory()
        node = DeliveryNodeFactory(consignee=consignee, item=po_item, quantity=150)

        consignee_item = ConsigneeItemFactory(consignee=consignee, item=po_item.item, amount_received=100,
                                              deliveries=[node.id])

        DeliveryNodeFactory(parents=[(node, 30)])
        DeliveryNodeFactory(parents=[(node, 25)])

        self.assertEqual(consignee_item.available_balance(), 45)

    def test_should_get_available_balance_of_item_with_loss(self):
        consignee = ConsigneeFactory()
        po_item = PurchaseOrderItemFactory()
        node = DeliveryNodeFactory(consignee=consignee, item=po_item, quantity=50)

        consignee_item = ConsigneeItemFactory(consignee=consignee, item=po_item.item, amount_received=40,
                                              deliveries=[node.id])
        loss = DeliveryNodeLossFactory(quantity=10, delivery_node=node)

        DeliveryNodeFactory(parents=[(node, 15)])
        DeliveryNodeFactory(parents=[(node, 8)])

        self.assertEqual(consignee_item.available_balance(), 7)
