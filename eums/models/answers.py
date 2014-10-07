from django.db import models
from eums.models import NodeLineItemRun, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion


class Answer(models.Model):
    line_item_run = models.ForeignKey(NodeLineItemRun)

    class Meta:
        abstract = True


class TextAnswer(Answer):
    question = models.ForeignKey(TextQuestion)
    value = models.CharField(max_length=255)


class NumericAnswer(Answer):
    question = models.ForeignKey(NumericQuestion)
    value = models.BigIntegerField()


class MultipleChoiceAnswer(Answer):
    question = models.ForeignKey(MultipleChoiceQuestion)
    value = models.ForeignKey(Option)
