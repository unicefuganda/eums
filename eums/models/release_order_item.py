from django.db import models
from eums.models import ReleaseOrder, Item, PurchaseOrderItem


class ReleaseOrderItem(models.Model):
    release_order = models.ForeignKey(ReleaseOrder)
    purchase_order_item = models.ForeignKey(PurchaseOrderItem)
    item = models.ForeignKey(Item)
    item_number = models.IntegerField(null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    value = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        app_label = 'eums'