import factory
from eums.models import MultipleChoiceAnswer, TextAnswer, NumericAnswer
from eums.test.factories.node_line_item_run_factory import NodeRunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory


class MultipleChoiceAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = MultipleChoiceAnswer

    node_run = factory.SubFactory(NodeRunFactory)
    question = factory.SubFactory(MultipleChoiceQuestionFactory)
    value = factory.SubFactory(OptionFactory)


class TextAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = TextAnswer

    node_run = factory.SubFactory(NodeRunFactory)
    question = factory.SubFactory(TextQuestionFactory)
    value = 'Some text'


class NumericAnswerFactory(factory.DjangoModelFactory):
    class Meta:
        model = NumericAnswer

    node_run = factory.SubFactory(NodeRunFactory)
    question = factory.SubFactory(NumericQuestionFactory)
    value = 42
