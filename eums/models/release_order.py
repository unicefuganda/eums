from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from eums.models import SalesOrder, PurchaseOrder, Consignee, DistributionPlanNode, ReleaseOrderItem


class ReleaseOrderManager(models.Manager):
    @staticmethod
    def for_consignee(consignee_id):
        order_item_ids = DistributionPlanNode.objects.filter(consignee__id=consignee_id).values_list('item')
        order_ids = ReleaseOrderItem.objects.filter(id__in=order_item_ids).values_list('release_order_id')
        orders = ReleaseOrder.objects.filter(id__in=order_ids)
        return orders

    @staticmethod
    def delivered():
        order_item_ids = DistributionPlanNode.objects.filter().values_list('item')
        order_ids = ReleaseOrderItem.objects.filter(id__in=order_item_ids).values_list('release_order_id')
        orders = ReleaseOrder.objects.filter(id__in=order_ids)
        return orders


class ReleaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder, related_name='release_orders')
    purchase_order = models.ForeignKey(PurchaseOrder, null=True, related_name='release_orders')
    consignee = models.ForeignKey(Consignee)
    waybill = models.IntegerField()
    delivery_date = models.DateField(auto_now=False)

    objects = ReleaseOrderManager()

    def delivery(self):
        item = self.items.first()
        try:
            return DistributionPlanNode.objects.get(item=item, parent=None).distribution_plan.id
        except ObjectDoesNotExist:
            return None

    class Meta:
        app_label = 'eums'
