from django.db import models
from eums.models import SalesOrder, Consignee


class ReleaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder)
    consignee = models.ForeignKey(Consignee)
    waybill = models.IntegerField()
    delivery_date = models.DateField(auto_now=False)

    class Meta:
        app_label = 'eums'