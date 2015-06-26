from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from eums.models import SalesOrder, PurchaseOrder, Consignee, DistributionPlanNode, DistributionPlan


class ReleaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder, related_name='release_orders')
    purchase_order = models.ForeignKey(PurchaseOrder, null=True, related_name='release_orders')
    consignee = models.ForeignKey(Consignee)
    waybill = models.IntegerField()
    delivery_date = models.DateField(auto_now=False)

    def delivery(self):
        item = self.items.first()
        try:
            return DistributionPlanNode.objects.get(item=item).distribution_plan.id
        except ObjectDoesNotExist:
            return None

    class Meta:
        app_label = 'eums'