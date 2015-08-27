from django.db import models
from eums.models import Runnable, Arc
from eums.models.delivery_node_manager import DeliveryNodeManager

positions = ((Runnable.MIDDLE_MAN, 'Middleman'), (Runnable.END_USER, 'End User'),
             (Runnable.IMPLEMENTING_PARTNER, 'Implementing Partner'))


class DistributionPlanNode(Runnable):
    distribution_plan = models.ForeignKey('DistributionPlan', null=True, blank=True)
    item = models.ForeignKey('OrderItem')
    tree_position = models.CharField(max_length=255, choices=positions)
    balance = models.IntegerField(null=True, blank=True, default=0)
    parents = None
    quantity = None
    objects = DeliveryNodeManager()

    def save(self, *args, **kwargs):
        if self.parents or self.parents == []:
            self._update_arcs()
        if self.quantity >= 0 and self.is_root():
            self._update_root_node_arc()
        if self.id and self.quantity_in() == 0 and self.track:
            self.delete()
            return self
        self.balance = self.quantity_in() - self.quantity_out()
        super(DistributionPlanNode, self).save(*args, **kwargs)
        self._update_parent_balances(self._parents())

    def delete(self, using=None):
        parents = list(self._parents())
        super(DistributionPlanNode, self).delete(using=using)
        self._update_parent_balances(parents)

    def quantity_in(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_in.all(), 0)

    def quantity_out(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_out.all(), 0)

    def get_ip(self):
        root_node = DistributionPlanNode.objects.root_nodes_for(delivery=self.distribution_plan).first()
        return {'id': root_node.id, 'location': root_node.location}

    def sender_name(self):
        return "UNICEF" if self.is_root() else self._parents().first().consignee.name

    def get_description(self):
        return self.item.item.description

    def children(self):
        children_ids = self.arcs_out.all().values_list('target_id')
        nodes = DistributionPlanNode.objects.filter(pk__in=children_ids)
        return nodes

    def has_children(self):
        return bool(self.children().count())

    @classmethod
    def get_delivery_for(cls, release_order_item):
        first_node = cls.objects.filter(item=release_order_item, arcs_in__source__isnull=True).first()
        return getattr(first_node, 'distribution_plan', None)

    def is_root(self):
        return self.arcs_in.exists() and not self.arcs_in.first().source

    @staticmethod
    def _update_parent_balances(parents):
        for parent in parents:
            parent._update_balance()

    def _update_balance(self):
        self.balance = self.quantity_in() - self.quantity_out()
        self.save()

    def _update_arcs(self):
        self.arcs_in.all().delete()
        for parent_dict in self.parents:
            Arc.objects.create(target=self, source_id=parent_dict['id'], quantity=parent_dict['quantity'])

    def _update_root_node_arc(self):
        arc = Arc.objects.get(target=self)
        arc.quantity = self.quantity
        arc.save()

    def _parents(self):
        source_ids = self.arcs_in.all().values_list('source_id')
        return DistributionPlanNode.objects.filter(pk__in=source_ids)

    def __unicode__(self):
        return "%s %s %s %s" % (self.consignee.name, self.tree_position, str(self.distribution_plan), self.item)

    def confirm(self):
        self.distribution_plan.confirm()

    def number(self):
        return self.item.number()

    def type(self):
        return self.item.type()

    def order_number(self):
        return self.item.number()

    def item_description(self):
        return self.item.item.description
