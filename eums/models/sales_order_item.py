from django.db import models
from eums.models import SalesOrder
from eums.models.order_item import OrderItem


class SalesOrderItem(OrderItem):
    sales_order = models.ForeignKey(SalesOrder)
    net_price = models.DecimalField(max_digits=20, decimal_places=4)
    net_value = models.DecimalField(max_digits=20, decimal_places=4)
    issue_date = models.DateField()
    delivery_date = models.DateField(null=True)
    description = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'
        unique_together = ('item', 'item_number', 'sales_order')

    def purchase_order_item(self):
        return self.purchaseorderitem_set.all().first()

    def __eq__(self, other):
        if not isinstance(other, SalesOrderItem):
            return False
        return (self.sales_order_id == other.sales_order_id
                and self.item_number == other.item_number
                and self.item_id == other.item_id
                and self.quantity == other.quantity
                and self.issue_date == other.issue_date
                and self.delivery_date == other.delivery_date
                and self.net_price == other.net_price
                and self.net_value == other.net_value
                and self.description == other.description)

    def __unicode__(self):
        return '%s' % self.description
