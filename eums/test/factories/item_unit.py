import factory

from eums.models import ItemUnit


class ItemUnitFactory(factory.DjangoModelFactory):
    class Meta:
        model = ItemUnit

    name = factory.Sequence(lambda n: "Item Unit {0}".format(n))

