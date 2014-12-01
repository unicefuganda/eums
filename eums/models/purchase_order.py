from django.db import models
from eums.models import SalesOrder


class PurchaseOrder(models.Model):
    order_number = models.CharField(max_length=255)
    sales_order = models.ForeignKey(SalesOrder)
    date = models.DateField(auto_now=False, null=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s - %s, %s %s" % (self.sales_order.programme.name, self.sales_order.description, self.order_number, str(self.date))