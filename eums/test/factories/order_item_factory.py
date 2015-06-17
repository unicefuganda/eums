import factory

from eums.models import OrderItem
from eums.test.factories.item_factory import ItemFactory


class OrderItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = OrderItem

    item = factory.SubFactory(ItemFactory)
    item_number = factory.Sequence(lambda n: 10 * n)
    quantity = 100
