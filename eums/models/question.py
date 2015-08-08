import ast
from django.db import models
from djorm_pgarray.fields import TextArrayField


class Question(models.Model):
    text = models.TextField()
    label = models.CharField(max_length=255)
    uuids = TextArrayField(dimension=1)
    flow = models.ForeignKey('Flow', related_name='questions')

    def __unicode__(self):
        return '%s' % self.text

    class Meta:
        unique_together = ('flow', 'label')


class NumericQuestion(Question):
    def create_answer(self, params, run):
        value = params['text']
        return self.numericanswer_set.create(question=self, value=value, run=run)


class TextQuestion(Question):
    def create_answer(self, params, run):
        value = params['text']
        return self.textanswer_set.create(question=self, value=value, run=run)


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
        return self.multiplechoiceanswer_set.create(question=self, value=matching_option, run=run)
