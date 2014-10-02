from django.db import models

from eums.models.item_unit import ItemUnit


class Item(models.Model):
    description = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    unit = models.ForeignKey(ItemUnit)

    class Meta:
        app_label = 'eums'
