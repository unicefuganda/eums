from django.db import models

from eums.models.order_item import OrderItem


class PurchaseOrderItem(OrderItem):
    purchase_order = models.ForeignKey('PurchaseOrder')
    sales_order_item = models.ForeignKey('SalesOrderItem')
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True)

    class Meta:
        app_label = 'eums'
        unique_together = ('purchase_order', 'item_number', 'sales_order_item')

    def __unicode__(self):
        return '%s %s %s.' % (self.purchase_order.order_number, str(self.item_number), self.sales_order_item.description)

    def __eq__(self, other):
        return self.purchase_order.order_number == other.purchase_order.order_number \
               and self.item_number == other.item_number \
               and self.sales_order_item.id == other.sales_order_item.id \
               and self.value == other.value \
               and self.quantity == other.quantity
