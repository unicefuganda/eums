from django.db import models
from django.db.models import Count
from eums.models import SalesOrder


class PurchaseOrderManager(models.Manager):
    def annotation(self):
        return self.model.objects.annotate(release_order_count=Count('release_orders'))

    def for_direct_delivery(self):
        return self.annotation().filter(release_order_count=0)


class PurchaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder)
    date = models.DateField(auto_now=False, null=True)
    objects = PurchaseOrderManager()

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s - %s, %s %s" % (self.sales_order.programme.name, self.sales_order.description, self.order_number, str(self.date))