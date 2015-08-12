from unittest import TestCase

from eums.models import Consignee, Question, ConsigneeItem, \
    PurchaseOrderItem, DistributionPlan
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.consignee_item_factory import ConsigneeItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class ConsigneeItemTest(TestCase):
    @classmethod
    def tearDownClass(cls):
        PurchaseOrderItem.objects.all().delete()
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def setUp(self):
        PurchaseOrderItem.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        fields_in_item = [field for field in ConsigneeItem._meta._name_map]
        self.assertEquals(len(ConsigneeItem._meta.fields), 5)
        for field in ['consignee', 'item', 'amount_received', 'deliveries']:
            self.assertIn(field, fields_in_item)

    def test_should_get_available_balance_of_item_distributed_by_consignee(self):
        consignee = ConsigneeFactory()
        po_item = PurchaseOrderItemFactory()
        node = DeliveryNodeFactory(consignee=consignee, item=po_item, quantity=150)

        consignee_item = ConsigneeItemFactory(consignee=consignee, item=po_item.item, amount_received=100,
                                              deliveries=[node.id])

        DeliveryNodeFactory(parents=[(node, 30)])
        DeliveryNodeFactory(parents=[(node, 25)])

        self.assertEqual(consignee_item.available_balance(), 45)
