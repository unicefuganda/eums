from django.db import models

from eums.models import PurchaseOrder, SalesOrderItem


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder)
    item_number = models.IntegerField()
    sales_order_item = models.ForeignKey(SalesOrderItem)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s, %s %s' % (self.purchase_order.order_number, str(self.item_number), self.sales_order_item.description)

