from django.db import models

from eums.models.item import Item


class SalesOrder(models.Model):
    order_number = models.CharField(max_length=255)
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    net_price = models.DecimalField(max_digits=20, decimal_places=4)
    net_value = models.DecimalField(max_digits=20, decimal_places=4)
    issue_date = models.DateField()
    delivery_date = models.DateField(null=True)

    class Meta:
        app_label = 'eums'