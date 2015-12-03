from django.db import models
from django.db.models import Count, Sum

from eums.models import SalesOrder, DistributionPlanNode as DeliveryNode, PurchaseOrderItem, DistributionPlan
from eums.models.time_stamped_model import TimeStampedModel


class PurchaseOrderManager(models.Manager):
    def for_direct_delivery(self, search_term=None, from_date=None, to_date=None):
        po_orders = self.model.objects.annotate(release_order_count=Count('release_orders'))
        no_release_orders = po_orders.filter(release_order_count=0)
        if from_date:
            no_release_orders = no_release_orders.filter(date__gte=from_date)
        if to_date:
            no_release_orders = no_release_orders.filter(date__lte=to_date)
        if search_term:
            no_release_orders = no_release_orders.filter(order_number__icontains=search_term)
        return no_release_orders

    def for_consignee(self, consignee_id):
        order_item_ids = DeliveryNode.objects.filter(consignee__id=consignee_id).values_list('item')
        order_ids = PurchaseOrderItem.objects.filter(id__in=order_item_ids).values_list('purchase_order')
        return self.model.objects.filter(id__in=order_ids)


class PurchaseOrder(TimeStampedModel):
    NOT_TRACKED = 'Not'
    PARTIALLY_TRACKED = 'Partially'
    FULLY_TRACKED = 'Fully'

    order_number = models.IntegerField(unique=True)
    sales_order = models.ForeignKey(SalesOrder)
    date = models.DateField(auto_now=False, null=True)
    is_single_ip = models.NullBooleanField(null=True)
    po_type = models.CharField(max_length=255, null=True)

    objects = PurchaseOrderManager()

    def has_plan(self):
        return DeliveryNode.objects.filter(item__in=self.purchaseorderitem_set.all()).exists()

    def is_fully_delivered(self):
        if self.has_plan():
            total_quantity = self.purchaseorderitem_set.aggregate(Sum('quantity')).get('quantity__sum')
            root_nodes = DeliveryNode.objects.root_nodes_for(order_items=self.purchaseorderitem_set.all(), track=True)
            total_quantity_distributed = reduce(lambda total, node: total + node.quantity_in(), root_nodes, 0)
            return total_quantity_distributed == total_quantity
        return False

    def deliveries(self, is_root=False):
        if is_root:
            plan_ids = DeliveryNode.objects.filter(item__in=self.purchaseorderitem_set.all(),arcs_in__source__isnull=True).values_list('distribution_plan_id').distinct()
        else:
            plan_ids = DeliveryNode.objects.filter(item__in=self.purchaseorderitem_set.all()).values_list('distribution_plan_id').distinct()

        return DistributionPlan.objects.filter(id__in=plan_ids)

    def total_value(self):
        return reduce(lambda total, item: total + item.value, self.purchaseorderitem_set.all(), 0)

    def track(self):
        track_list = [delivery[0] for delivery in self.deliveries(is_root=True).values_list('track')]
        if len(track_list) == 0 or not (True in track_list):
            return PurchaseOrder.NOT_TRACKED
        if self.is_fully_delivered() and not (False in track_list):
            return PurchaseOrder.FULLY_TRACKED
        return PurchaseOrder.PARTIALLY_TRACKED

    def tracked_date(self):
        track_list = [delivery[0] for delivery in self.deliveries(is_root=True).values_list('tracked_date')]
        while None in track_list:
            track_list.remove(None)
        track_list.sort()
        return track_list[0] if (len(track_list)) else ''

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s - %s, %s %s" % (
            self.sales_order.programme.name, self.sales_order.description, self.order_number, str(self.date))
