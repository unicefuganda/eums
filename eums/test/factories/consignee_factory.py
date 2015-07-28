import factory
from eums.models import Consignee
from eums.test.factories.user_factory import UserFactory


class ConsigneeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Consignee

    name = factory.Sequence(lambda n: "Consignee {0}".format(n))
    customer_id = factory.Sequence(lambda n: "{0}".format(n))
    type = Consignee.TYPES.implementing_partner
    location = 'Kampala',
    imported_from_vision = False
    created_by_user = factory.SubFactory(UserFactory)
