from django.db import models

from eums.models import PurchaseOrder, SalesOrderItem


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder)
    item_number = models.IntegerField()
    sales_order_item = models.ForeignKey(SalesOrderItem)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s' % self.sales_order_item.item.description

