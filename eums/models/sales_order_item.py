from django.db import models
from eums.models import SalesOrder

from eums.models.item import Item


class SalesOrderItem(models.Model):
    sales_order = models.ForeignKey(SalesOrder)
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    net_price = models.DecimalField(max_digits=20, decimal_places=4)
    net_value = models.DecimalField(max_digits=20, decimal_places=4)
    issue_date = models.DateField()
    delivery_date = models.DateField(null=True)

    class Meta:
        app_label = 'eums'