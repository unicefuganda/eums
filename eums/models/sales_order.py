from django.db import models


class SalesOrder(models.Model):
    order_number = models.CharField(max_length=255)
    date = models.DateField(auto_now=False)

    class Meta:
        app_label = 'eums'