import factory

from eums.models import Consignee


class ConsigneeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Consignee

    name = factory.Sequence(lambda n: "Consignee {0}".format(n))
    contact_person_id = factory.Sequence(lambda n: "{0}".format(n))