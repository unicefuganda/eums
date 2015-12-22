from django.db import models

from eums.models import ItemUnit
from eums.models.time_stamped_model import TimeStampedModel


class Item(TimeStampedModel):
    description = models.CharField(max_length=255, null=True)
    material_code = models.CharField(max_length=255)
    unit = models.ForeignKey(ItemUnit, null=True)

    class Meta:
        app_label = 'eums'
        unique_together = ('description', 'material_code')

    def __unicode__(self):
        return '%s' % self.description
