from django.db import models
from eums.models import NodeRun, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion


class TextAnswer(models.Model):
    node_run = models.ForeignKey(NodeRun)
    question = models.ForeignKey(TextQuestion)
    value = models.CharField(max_length=255)

    def format(self):
        return self.value

    def __unicode__(self):
        return '%s' % self.value


class NumericAnswer(models.Model):
    node_run = models.ForeignKey(NodeRun)
    question = models.ForeignKey(NumericQuestion)
    value = models.BigIntegerField()

    def format(self):
        return u'%s' % self.value

    def __unicode__(self):
        return '%s' % self.value


class MultipleChoiceAnswer(models.Model):
    node_run = models.ForeignKey(NodeRun)
    question = models.ForeignKey(MultipleChoiceQuestion)
    value = models.ForeignKey(Option)

    def format(self):
        return self.value.text

    def __unicode__(self):
        return '%s' % self.value.text
