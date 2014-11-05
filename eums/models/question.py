import ast
from django.db import models
from djorm_pgarray.fields import TextArrayField


class Question(models.Model):
    text = models.TextField()
    label = models.CharField(max_length=255, unique=True)
    uuids = TextArrayField(dimension=1)

    def __unicode__(self):
        return '%s' % self.text


class NumericQuestion(Question):
    def create_answer(self, params, line_item_run):
        value = params['text']
        return self.numericanswer_set.create(question=self, value=value, line_item_run=line_item_run)


class TextQuestion(Question):
    def create_answer(self, params, line_item_run):
        value = params['text']
        return self.textanswer_set.create(question=self, value=value, line_item_run=line_item_run)


class MultipleChoiceQuestion(Question):
    UNCATEGORISED = 'UNCATEGORISED'

    def save(self, *args, **kwargs):
        super(MultipleChoiceQuestion, self).save(*args, **kwargs)
        self.option_set.create(text=self.UNCATEGORISED)

    def create_answer(self, raw_params, line_item_run):
        params = dict(raw_params)
        values = []
        for val in params['values']:
            values.extend(ast.literal_eval(val))

        params = filter(lambda v: self.label == v['label'], values)[0]
        matching_option = self.option_set.get(text=params['category']['eng'])
        return self.multiplechoiceanswer_set.create(question=self, value=matching_option, line_item_run=line_item_run)