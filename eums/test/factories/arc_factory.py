import factory

from eums.models import Arc
from eums.test.factories.distribution_plan_node_factory import DeliveryNodeFactory


class ArcFactory(factory.DjangoModelFactory):
    class Meta:
        model = Arc

    source = factory.SubFactory(DeliveryNodeFactory)
    target = factory.SubFactory(DeliveryNodeFactory)
    quantity = 5
