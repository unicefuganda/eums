from decimal import Decimal
from django.db import models
from eums.models import PurchaseOrderItem
from eums.models.order_item import OrderItem


class ReleaseOrderItem(OrderItem):
    release_order = models.ForeignKey('ReleaseOrder', related_name='items')
    purchase_order_item = models.ForeignKey(PurchaseOrderItem)
    value = models.DecimalField(max_digits=12, decimal_places=2)

    def unit_value(self):
        return self.value / Decimal(self.quantity)

    class Meta:
        app_label = 'eums'
