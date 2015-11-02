from decimal import Decimal
from django.db import models
from django.db.models import Sum

from eums.models import OrderItem
from eums.models import DistributionPlanNode


class PurchaseOrderItem(OrderItem):

    PURCHASE_ORDER = "Purchase Order"

    purchase_order = models.ForeignKey('PurchaseOrder')
    sales_order_item = models.ForeignKey('SalesOrderItem')
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True)

    def available_balance(self):
        return self.quantity - self.quantity_shipped()

    def quantity_shipped(self):
        nodes = DistributionPlanNode.objects.filter(item=self, track=True, arcs_in__source__isnull=True)
        return reduce(lambda total, node: total + node.quantity_in(), nodes, 0)

    def unit_value(self):
        return Decimal(self.value) / Decimal(self.quantity)

    def number(self):
        return self.purchase_order.order_number

    def __unicode__(self):
        return '%s %s %s.' \
               % (self.purchase_order.order_number, str(self.item_number), self.sales_order_item.description)

    def __eq__(self, other):
        if not isinstance(other, PurchaseOrderItem):
            return False
        return self.purchase_order.order_number == other.purchase_order.order_number \
               and self.item_number == other.item_number \
               and self.sales_order_item.id == other.sales_order_item.id \
               and self.value == other.value \
               and self.quantity == other.quantity

    def type(self):
        return self.PURCHASE_ORDER