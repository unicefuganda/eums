import factory
from eums.models import Question


class QuestionFactory(factory.DjangoModelFactory):
    class Meta:
        model = Question

    text = 'What is your name'
    label = factory.Sequence(lambda n: 'label {0}'.format(n))
    uuids = [factory.Sequence(lambda n: '{0}'.format(n))]
