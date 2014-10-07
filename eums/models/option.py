from django.db import models
from eums.models.question import MultipleChoiceQuestion


class Option(models.Model):
    UNCATEGORISED = 'UNCATEGORISED'

    text = models.CharField(max_length=255)
    question = models.ForeignKey(MultipleChoiceQuestion)

    class Meta:
        unique_together = ('text', 'question')