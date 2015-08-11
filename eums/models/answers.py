from django.db import models
from eums.models import Run, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion
from eums.models import question_hooks


class Answer(models.Model):
    class Meta:
        abstract = True

    def save(self, **kwargs):
        if self.id:
            previous_answer = type(self).objects.get(pk=self.id)
            self._post_create_hook()(previous_answer).rollback()

        answer = super(Answer, self).save(**kwargs)
        self._post_create_hook()(self).run()
        return answer

    def delete(self, using=None):
        super(Answer, self).delete()
        self._post_create_hook()(self).rollback()

    def _post_create_hook(self):
        hook_name = self.question.when_answered or ''
        return getattr(question_hooks, hook_name, NullHook)


class TextAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(TextQuestion)
    value = models.CharField(max_length=255)

    def format(self):
        return self.value

    def __unicode__(self):
        return '%s' % self.value


class NumericAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(NumericQuestion)
    value = models.BigIntegerField()

    def format(self):
        return u'%s' % self.value

    def __unicode__(self):
        return '%s' % self.value


class MultipleChoiceAnswer(Answer):
    run = models.ForeignKey(Run)
    question = models.ForeignKey(MultipleChoiceQuestion, related_name='answers')
    value = models.ForeignKey(Option)

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
