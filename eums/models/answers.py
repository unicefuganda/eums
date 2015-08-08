from django.db import models
from eums.models import Run, Option
from eums.models.question import TextQuestion, NumericQuestion, MultipleChoiceQuestion
from eums.models import question_hooks


class Answer(models.Model):
    class Meta:
        abstract = True

    def save(self, **kwargs):
        super(Answer, self).save(**kwargs)
        self._post_create_hook()(self.value)

    def delete(self, using=None):
        super(Answer, self).delete()
        self._post_create_hook()(self.value, rollback=True)

    def _post_create_hook(self):
        hook_name = self.question.when_answered or ''
        null_function = lambda *args, **kwargs: None
        return getattr(question_hooks, hook_name, null_function)


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
    question = models.ForeignKey(MultipleChoiceQuestion)
    value = models.ForeignKey(Option)

    def format(self):
        return self.value.text

    def __unicode__(self):
        return '%s' % self.value.text
