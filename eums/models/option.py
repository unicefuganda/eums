from django.db import models
from eums.models.question import MultipleChoiceQuestion
from eums.models.time_stamped_model import TimeStampedModel


class Option(TimeStampedModel):
    UNCATEGORISED = 'UNCATEGORISED'

    text = models.CharField(max_length=255)
    question = models.ForeignKey(MultipleChoiceQuestion)

    class Meta:
        unique_together = ('text', 'question')

    def __unicode__(self):
        return self.text

    @staticmethod
    def build_option(**kwargs):
        text = kwargs.get("text")
        question = kwargs.get("question")
        option = Option.objects.filter(text=text, question=question)
        if option.count() < 1:
            option = Option.objects.create(text=text, question=question)
        else:
            option = option[0]
        return option
