from django.db import models

from eums.models.item import Item


class SalesOrder(models.Model):
    order_number = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'