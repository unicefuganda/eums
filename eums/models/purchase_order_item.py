from django.db import models

from eums.models import PurchaseOrder, SalesOrderItem
from eums.models.order_item import OrderItem


class PurchaseOrderItem(OrderItem):
    purchase_order = models.ForeignKey(PurchaseOrder)
    sales_order_item = models.ForeignKey(SalesOrderItem)
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True)

    class Meta:
        app_label = 'eums'
        unique_together = ('purchase_order', 'item_number', 'sales_order_item')

    def __unicode__(self):
        return '%s %s %s.' % (self.purchase_order.order_number, str(self.item_number), self.sales_order_item.description)

