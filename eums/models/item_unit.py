from django.db import models
from eums.models.time_stamped_model import TimeStampedModel


class ItemUnit(TimeStampedModel):
    name = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s' % self.name
