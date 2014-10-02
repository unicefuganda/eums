from django.db import models


class SalesOrder(models.Model):
    order_number = models.CharField(max_length=255)
    sales_document = models.CharField(max_length=255)
    material_code = models.CharField(max_length=255)
    date_created = models.CharField(max_length=255)
    order_quantity = models.CharField(max_length=255)
    net_value = models.CharField(max_length=255)
    net_price = models.CharField(max_length=255)
    description = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'