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
