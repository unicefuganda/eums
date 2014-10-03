from django.db import models
from eums.models import Question


class Option(models.Model):
    UNCATEGORISED = 'UNCATEGORISED'

    text = models.CharField(max_length=255)
    question = models.ForeignKey(Question)

    class Meta:
        unique_together = ('text', 'question')
