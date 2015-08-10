from django.db import models

from eums.models import ItemUnit


class Item(models.Model):
    description = models.CharField(max_length=255)
    material_code = models.CharField(max_length=255)
    unit = models.ForeignKey(ItemUnit, null=True)

    class Meta:
        app_label = 'eums'
        unique_together = ('description', 'material_code')

    def __unicode__(self):
        return '%s' % self.description
