import factory
from eums.models import Option
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory


class OptionFactory(factory.DjangoModelFactory):
    class Meta:
        model = Option

    question = factory.SubFactory(MultipleChoiceQuestionFactory)
    text = factory.Sequence(lambda n: 'option {0}'.format(n))