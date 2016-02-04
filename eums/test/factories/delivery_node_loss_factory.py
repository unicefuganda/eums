import factory

from eums.models.delivery_node_loss import DeliveryNodeLoss
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class DeliveryNodeLossFactory(factory.DjangoModelFactory):
    class Meta:
        model = DeliveryNodeLoss

    quantity = 5
    remark = 'some bad thing'
    delivery_node = factory.SubFactory(DeliveryNodeFactory)

