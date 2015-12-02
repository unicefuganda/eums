import datetime
from django.db import models
from django.db.models import Q
from django.utils import timezone
from eums.models import Run, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion
from eums.models import question_hooks
from eums.models.time_stamped_model import TimeStampedModel


class Answer(TimeStampedModel):
    class Meta:
        abstract = True

    def save(self, **kwargs):
        if self.id:
            previous_answer = type(self).objects.get(pk=self.id)
            self._get_post_create_hook()(previous_answer).rollback()
        answer = super(Answer, self).save(**kwargs)
        self._get_post_create_hook()(self).run()
        return answer

    def delete(self, using=None):
        super(Answer, self).delete()
        self._get_post_create_hook()(self).rollback()

    def _get_post_create_hook(self):
        hook_name = self.question.when_answered or ''
        return getattr(question_hooks, hook_name, NullHook)

    @staticmethod
    def build_answer(runnable, questions, answer_type):
        answers = []
        for question in questions:
            answer = answer_type.objects.filter(Q(run__runnable_id=runnable.id),
                                                Q(question=question),
                                                ~ Q(run__status='cancelled'),
                                                ~ Q(run__status='expired'))

            if answer.count() > 1:
                answer = answer.order_by('-modified')

            answers.append(
                Answer._build_answer_response(answer, question)
            )
        return answers

    @staticmethod
    def _build_answer_response(answer, question):
        options = Answer._build_options(question)

        answer_response = {
            'question_label': question.label,
            'type': question.type,
            'text': question.text,
            'value': answer.first().value if answer else '',
            'position': question.position
        }

        if options:
            answer_response['value'] = answer.first().value.text if answer else ''
            answer_response['options'] = options

        return answer_response

    @staticmethod
    def _build_options(question):
        options = []
        try:
            for option in question.option_set.all():
                options.append(option.text) if option.text != 'UNCATEGORISED' else None
        except:
            pass
        return options


class TextAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(TextQuestion)
    value = models.CharField(max_length=255)
    date_created = models.DateTimeField(default=timezone.now)

    def format(self):
        return self.value

    def __unicode__(self):
        return '%s' % self.value


class NumericAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(NumericQuestion)
    value = models.BigIntegerField()
    date_created = models.DateTimeField(default=timezone.now)

    def format(self):
        return u'%s' % self.value

    def __unicode__(self):
        return '%s' % self.value


class MultipleChoiceAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(MultipleChoiceQuestion, related_name='answers')
    value = models.ForeignKey(Option)
    date_created = models.DateTimeField(default=timezone.now)

    def format(self):
        return self.value.text

    def __unicode__(self):
        return '%s' % self.value.text


class NullHook:
    def __init__(self, *args, **kwargs):
        pass

    def run(self, *args, **kwargs):
        pass

    def rollback(self, *args, **kwargs):
        pass
