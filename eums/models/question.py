from django.db import models


class Question(models.Model):
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
    OPEN_ENDED = 'OPEN_ENDED'
    NUMERIC = 'NUMERIC'

    text = models.TextField()
    uuid = models.CharField(max_length=255)
    type = models.CharField(max_length=255, choices=(
        (MULTIPLE_CHOICE, 'Multiple Choice'), (OPEN_ENDED, 'Open Ended'), (NUMERIC, 'Numeric')))