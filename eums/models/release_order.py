from django.db import models
from eums.models import SalesOrder, PurchaseOrder, Consignee


class ReleaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder)
    purchase_order = models.ForeignKey(PurchaseOrder, null=True)
    consignee = models.ForeignKey(Consignee)
    waybill = models.IntegerField()
    delivery_date = models.DateField(auto_now=False)

    class Meta:
        app_label = 'eums'