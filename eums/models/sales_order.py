from django.db import models
from django.db.models import Count

from eums.models import Programme


class SalesOrderManager(models.Manager):
    # def __init__(self):
    #     self.annotated = SaleOrder.objects.annotate(release_order_count=Count('release_orders'))
        # self.annotated = []

    def without_release_orders(self):
        return SalesOrder.objects.annotate(release_order_count=Count('release_orders')) \
            .filter(release_order_count=0)

    def with_release_orders(self):
        return SalesOrder.objects.annotate(release_order_count=Count('release_orders')) \
            .filter(release_order_count__gte=1)


class SalesOrder(models.Model):
    programme = models.ForeignKey(Programme)
    order_number = models.IntegerField(unique=True)
    date = models.DateField(auto_now=False)
    description = models.CharField(max_length=255, null=True)
    objects = SalesOrderManager()

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s, %s %s" % (self.programme.name, self.order_number, str(self.date))