from django.db import models
from eums.models import Question, NodeLineItemRun, Option


class Answer(models.Model):
    question = models.ForeignKey(Question)
    node_run = models.ForeignKey(NodeLineItemRun)

    class Meta:
        abstract = True


class TextAnswer(Answer):
    value = models.CharField(max_length=255)


class NumericAnswer(Answer):
    value = models.BigIntegerField()


class MultipleChoiceAnswer(Answer):
    value = models.ForeignKey(Option)