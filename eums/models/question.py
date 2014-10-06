from django.db import models


class Question(models.Model):
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
    TEXT = 'TEXT'
    NUMERIC = 'NUMERIC'

    text = models.TextField()
    uuids = models.TextField()
    label = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=255, choices=(
        (MULTIPLE_CHOICE, 'Multiple Choice'), (TEXT, 'Open Ended'), (NUMERIC, 'Numeric')))

    def save(self, *args, **kwargs):
        super(Question, self).save(*args, **kwargs)
        if self.type is self.MULTIPLE_CHOICE:
            self.option_set.create(text='UNCATEGORISED')