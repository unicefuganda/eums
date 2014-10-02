import factory

from eums.models import Item
from eums.test.factories.item_unit import ItemUnitFactory


class ItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = Item

    description = factory.Sequence(lambda n: "Item {0}".format(n))
    material_code = factory.Sequence(lambda n: "Code {0}".format(n))
    unit = factory.SubFactory(ItemUnitFactory)
