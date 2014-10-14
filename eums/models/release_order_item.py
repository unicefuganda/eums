from django.db import models
from eums.models import ReleaseOrder, Item


class ReleaseOrderItem(models.Model):
    release_order = models.ForeignKey(ReleaseOrder)
    purchase_order = models.CharField(max_length=100)
    item = models.ForeignKey(Item)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    value = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        app_label = 'eums'