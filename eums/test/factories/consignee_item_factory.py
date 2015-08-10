import factory

from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.models import ConsigneeItem
from eums.test.factories.consignee_factory import ConsigneeFactory


class ConsigneeItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = ConsigneeItem

    consignee = factory.SubFactory(ConsigneeFactory)
    item = factory.SubFactory(ItemFactory)
    latest_delivery = factory.SubFactory(DeliveryNodeFactory)
