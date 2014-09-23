import factory

from eums.models import Programme
from eums.test.factories.user_factory import UserFactory


class ProgrammeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Programme

    name = factory.Sequence(lambda n: 'Programme {0}'.format(n))
    focal_person = factory.SubFactory(UserFactory)
