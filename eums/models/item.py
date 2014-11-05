from django.db import models

from eums.models.item_unit import ItemUnit


class Item(models.Model):
    description = models.CharField(max_length=255)
    material_code = models.CharField(max_length=255)
    unit = models.ForeignKey(ItemUnit, null=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s' % self.description
