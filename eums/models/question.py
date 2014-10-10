import ast
from django.db import models
from djorm_pgarray.fields import TextArrayField


class Question(models.Model):
    text = models.TextField()
    label = models.CharField(max_length=255, unique=True)
    final = models.BooleanField(default=False)
    uuids = TextArrayField(dimension=1)

    def __str__(self):
        return self.text


class NumericQuestion(Question):
    def create_answer(self, params, line_item_run):
        value = params['text']
        self.numericanswer_set.create(question=self, value=value, line_item_run=line_item_run)


class TextQuestion(Question):
    def create_answer(self, params, line_item_run):
        value = params['text']
        self.textanswer_set.create(question=self, value=value, line_item_run=line_item_run)


class MultipleChoiceQuestion(Question):
    def save(self, *args, **kwargs):
        super(MultipleChoiceQuestion, self).save(*args, **kwargs)
        self.option_set.create(text='UNCATEGORISED')

    def create_answer(self, params, line_item_run):
        values = ast.literal_eval(params['values'])
        params = filter(lambda v: self.label == v['label'], values)[0]
        matching_option = self.option_set.get(text=params['category'])
        self.multiplechoiceanswer_set.create(question=self, value=matching_option, line_item_run=line_item_run)