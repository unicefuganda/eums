import ast

from django.db import models
from djorm_pgarray.fields import TextArrayField


class Question(models.Model):
    text = models.TextField()
    label = models.CharField(max_length=255)
    uuids = TextArrayField(dimension=1)
    flow = models.ForeignKey('Flow', related_name='questions')
    when_answered = models.CharField(max_length=255, null=True)
    position = models.IntegerField(default=1)

    def __unicode__(self):
        return '%s' % self.text

    class Meta:
        unique_together = ('flow', 'label')


class NumericQuestion(Question):
    def create_answer(self, params, run):
        value = params['text']
        answer = self.numericanswer_set.create(question=self, value=value, run=run)
        return answer


class TextQuestion(Question):
    def create_answer(self, params, run):
        value = params['text']
        answer = self.textanswer_set.create(question=self, value=value, run=run)
        return answer


class MultipleChoiceQuestion(Question):
    UNCATEGORISED = 'UNCATEGORISED'

    def save(self, *args, **kwargs):
        super(MultipleChoiceQuestion, self).save(*args, **kwargs)
        self.option_set.create(text=self.UNCATEGORISED)

    def create_answer(self, raw_params, run):
        params = dict(raw_params)
        values = []
        for val in params['values']:
            values.extend(ast.literal_eval(val))

        params = filter(lambda v: self.label == v['label'], values)[0]
        matching_option = self.option_set.get(text=params['category']['eng'])
        return self.answers.create(question=self, value=matching_option, run=run)
