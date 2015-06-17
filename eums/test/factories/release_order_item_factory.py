import factory

from eums.models import ReleaseOrderItem
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class ReleaseOrderItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = ReleaseOrderItem

    release_order = factory.SubFactory(ReleaseOrderFactory)
    purchase_order_item = factory.SubFactory(PurchaseOrderItemFactory)
    item_number = factory.Sequence(lambda n: 10 * n)
    item = factory.SubFactory(ItemFactory)
    quantity = 100
    value = 1000.00