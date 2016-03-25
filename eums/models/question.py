import ast
import datetime as datetime
import re

from django.db import models
from model_utils import Choices
from eums.models.time_stamped_model import TimeStampedModel


class Question(TimeStampedModel):
    LABEL = Choices('deliveryReceived', 'isDeliveryInGoodOrder', 'itemReceived', 'qualityOfProduct',
                    'satisfiedWithDelivery', 'additionalDeliveryComments', 'dateOfReceipt', 'amountReceived',
                    'productReceived', 'satisfiedWithProduct')

    text = models.TextField()
    label = models.CharField(max_length=255)
    flow = models.ForeignKey('Flow', related_name='questions')
    when_answered = models.CharField(max_length=255, null=True)
    position = models.IntegerField(default=1)

    def __unicode__(self):
        return '%s' % self.text

    class Meta:
        unique_together = ('flow', 'label')

    def get_subclass_instance(self):
        return getattr(self, 'numericquestion', None) or \
               getattr(self, 'textquestion', None) or \
               getattr(self, 'multiplechoicequestion', None)

    @staticmethod
    def build_question(question_type, **kwargs):
        label = kwargs.get("label")
        flow = kwargs.get("flow")
        text = kwargs.get("text")
        position = kwargs.get("position")
        when_answered = kwargs.get("when_answered")
        question = question_type.objects.filter(label=label, flow=flow)
        if question.exists():
            question.update(text=text, position=position)
            question = question[0]
        else:
            if when_answered is None:
                question = question_type.objects.create(
                        text=text, label=label, flow=flow, position=position)
            else:
                question = question_type.objects.create(
                        text=text, label=label, flow=flow, when_answered=when_answered, position=position)
        return question


class NumericQuestion(Question):
    type = models.CharField(max_length=255, choices=[('numeric', 'numeric question')], default='numeric')

    def create_answer(self, params, run):
        value = params['text']
        answer = self.numericanswer_set.create(question=self, value=value, run=run)
        return answer


class TextQuestion(Question):
    type = models.CharField(max_length=255, choices=(('text', 'text question'),
                                                     ('date', 'date question')),
                            default='text')

    def create_answer(self, params, run):
        value = params['text']
        if self.label == Question.LABEL.dateOfReceipt:
            value = self.__format_date(value)
        answer = self.textanswer_set.create(question=self, value=value, run=run)
        return answer

    def __format_date(self, val):
        is_complete_date_format = re.search('^\d{4}-(0?[1-9]|10|11|12)-\d{1,2}.*', val)
        if is_complete_date_format:
            return val
        else:
            date_part_matcher = re.search('^\d+[^\d]+\d+[^\d]+\d+', val)
            if date_part_matcher:
                raw_date = re.sub(r'[^\d]+', '-', date_part_matcher.group(0))

                date_patterns = ['%d-%m-%Y', '%m-%d-%Y', '%Y-%m-%d']
                for pattern in date_patterns:
                    try:
                        return datetime.datetime.strptime(raw_date, pattern).date()
                    except StandardError:
                        pass

            return ''


class MultipleChoiceQuestion(Question):
    UNCATEGORISED = 'UNCATEGORISED'
    type = models.CharField(max_length=255,
                            choices=[('multipleChoice', 'multiple choice question')],
                            default='multipleChoice')

    def save(self, *args, **kwargs):
        super(MultipleChoiceQuestion, self).save(*args, **kwargs)
        self.option_set.create(text=self.UNCATEGORISED)

    def create_answer(self, raw_params, run):
        params = dict(raw_params)
        values = []
        for val in params['values']:
            values.extend(ast.literal_eval(val))

        params = filter(lambda v: self.label == v['label'], values)
        param = params[len(params) - 1]

        matching_option = self.option_set.get(text=param['category']['eng'])
        return self.answers.create(question=self, value=matching_option, run=run)
