from eums.models import Consignee
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.consignee_item_factory import ConsigneeItemFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory

consignee_wakiso = Consignee.objects.get(name='WAKISO DHO')

item = ItemFactory(description='Three-pronged power cables')
order_item = PurchaseOrderItemFactory(item=item)
deliver_node_one = DeliveryNodeFactory(item=order_item, consignee=consignee_wakiso)
deliver_node_two = DeliveryNodeFactory(item=order_item, consignee=consignee_wakiso)
ArcFactory(quantity=30, source=None, target=deliver_node_one)
ArcFactory(quantity=20, source=None, target=deliver_node_two)

ConsigneeItemFactory(
    item=item,
    amount_received=50,
    consignee=consignee_wakiso,
    deliveries=[deliver_node_one.id, deliver_node_two.id])
