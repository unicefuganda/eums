from django.db import models
from eums.models import NodeLineItemRun, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion


class TextAnswer(models.Model):
    line_item_run = models.ForeignKey(NodeLineItemRun)
    question = models.ForeignKey(TextQuestion)
    value = models.CharField(max_length=255)


class NumericAnswer(models.Model):
    line_item_run = models.ForeignKey(NodeLineItemRun)
    question = models.ForeignKey(NumericQuestion)
    value = models.BigIntegerField()


class MultipleChoiceAnswer(models.Model):
    line_item_run = models.ForeignKey(NodeLineItemRun)
    question = models.ForeignKey(MultipleChoiceQuestion)
    value = models.ForeignKey(Option)
