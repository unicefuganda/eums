from django.db import models
from eums.models import SalesOrder, Consignee


class ReleaseOrder(models.Model):
    order_number = models.CharField(max_length=255)
    sales_order = models.ForeignKey(SalesOrder)
    delivery_date = models.DateField(auto_now=False)
    waybill = models.CharField(max_length=100)
    consignee = models.ForeignKey(Consignee)

    class Meta:
        app_label = 'eums'