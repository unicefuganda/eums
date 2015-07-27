import factory
from eums.models import MultipleChoiceAnswer, TextAnswer, NumericAnswer
from eums.test.factories.run_factory import RunFactory

from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory


class MultipleChoiceAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = MultipleChoiceAnswer

    run = factory.SubFactory(RunFactory)
    question = factory.SubFactory(MultipleChoiceQuestionFactory)
    value = factory.SubFactory(OptionFactory)


class TextAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = TextAnswer

    run = factory.SubFactory(RunFactory)
    question = factory.SubFactory(TextQuestionFactory)
    value = 'Some text'


class NumericAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = NumericAnswer

    run = factory.SubFactory(RunFactory)
    question = factory.SubFactory(NumericQuestionFactory)
    value = 42
