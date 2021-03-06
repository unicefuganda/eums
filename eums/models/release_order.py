from django.db import models

from eums.models import SalesOrder, PurchaseOrder, Consignee, DistributionPlan, DistributionPlanNode, ReleaseOrderItem, \
    Runnable
from eums.models.time_stamped_model import TimeStampedModel


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


class ReleaseOrder(TimeStampedModel):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder, related_name='release_orders')
    purchase_order = models.ForeignKey(PurchaseOrder, null=True, related_name='release_orders')
    consignee = models.ForeignKey(Consignee)
    waybill = models.IntegerField()
    delivery_date = models.DateField(auto_now=False)
    tracked_date = models.DateTimeField(null=True)
    date = models.DateField(auto_now=False, null=True)

    objects = ReleaseOrderManager()

    def delivery(self):
        item = self.items.first()
        return getattr(DistributionPlanNode.get_delivery_for(item), 'id', None)

    def track(self):
        delivery_id = self.delivery()
        return getattr(Runnable.objects.get(pk=delivery_id), 'track', None) if delivery_id else None

    def last_shipment_date(self):
        delivery_id = self.delivery()
        return DistributionPlan.objects.get(pk=delivery_id).last_shipment_date if delivery_id else None

    class Meta:
        app_label = 'eums'
