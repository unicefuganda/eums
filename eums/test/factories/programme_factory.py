import factory

from eums.models import Programme


class ProgrammeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Programme

    name = factory.Sequence(lambda n: 'Programme {0}'.format(n))