from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db.models import Count, Sum

from eums.models import SalesOrder, DistributionPlanNode, PurchaseOrderItem


class PurchaseOrderManager(models.Manager):
    def for_direct_delivery(self):
        return self.model.objects.annotate(release_order_count=Count('release_orders')).filter(release_order_count=0)

    @staticmethod
    def for_consignee(consignee_id):
        order_item_ids = DistributionPlanNode.objects.filter(consignee__id=consignee_id).values_list('item')
        order_ids = PurchaseOrderItem.objects.filter(id__in=order_item_ids).values_list('purchase_order')
        return PurchaseOrder.objects.filter(id__in=order_ids)


class PurchaseOrder(models.Model):
    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder)
    date = models.DateField(auto_now=False, null=True)
    is_single_ip = models.NullBooleanField(null=True)
    po_type = models.CharField(max_length=255, null=True)

    objects = PurchaseOrderManager()

    def has_plan(self):
        return DistributionPlanNode.objects.filter(item__in=self.purchaseorderitem_set.all()).exists()

    def is_fully_delivered(self):
        if self.has_plan():
            total_purchase_order_items = self.purchaseorderitem_set.aggregate(Sum('quantity'))
            total_node_items = DistributionPlanNode.objects.filter(item__in=self.purchaseorderitem_set.all(),
                                                                   tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER).aggregate(
                Sum('targeted_quantity'))
            return total_node_items['targeted_quantity__sum'] == total_purchase_order_items['quantity__sum']
        else:
            return False

    def delivery(self):
        first_node = DistributionPlanNode.objects.filter(item__in=self.purchaseorderitem_set.all()).first()
        if first_node:
            return first_node.distribution_plan.id
        else:
            return None

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s - %s, %s %s" % (
            self.sales_order.programme.name, self.sales_order.description, self.order_number, str(self.date))
