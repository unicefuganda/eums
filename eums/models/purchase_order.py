from django.db import models
from eums.models import SalesOrder


class PurchaseOrder(models.Model):
    order_number = models.CharField(max_length=255)
    sales_order = models.ForeignKey(SalesOrder)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s, %s" % (self.sales_order.order_number, self.order_number)