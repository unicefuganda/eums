import factory

from eums.models import Consignee


class ConsigneeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Consignee

    name = factory.Sequence(lambda n: "Consignee {0}".format(n))
    customer_id = factory.Sequence(lambda n: "{0}".format(n))
    type = Consignee.TYPES.implementing_partner