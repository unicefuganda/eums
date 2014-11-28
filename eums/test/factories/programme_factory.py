import factory

from eums.models import Programme


class ProgrammeFactory(factory.DjangoModelFactory):
    class Meta:
        model = Programme

    name = factory.Sequence(lambda n: 'Programme {0}'.format(n))
    wbs_element_ex = factory.Sequence(lambda n: '%d/A%d/%d/%d' % (n, n+1, n+2, n+3))