import factory

from eums.models import PurchaseOrderItem
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class PurchaseOrderItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = PurchaseOrderItem

    purchase_order = factory.SubFactory(PurchaseOrderFactory)
    sales_order_item = factory.SubFactory(SalesOrderItemFactory)
    item_number = factory.Sequence(lambda n: 10 * n)
    item = factory.SubFactory(ItemFactory)
    quantity = 100
    value = 1000.00
