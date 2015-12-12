from django.db import models
from django.db.models import Q
from eums.models.flow import Flow
from eums.models import Runnable, Arc, Programme
from eums.models.delivery_node_manager import DeliveryNodeManager

positions = ((Flow.Label.MIDDLE_MAN, 'Middleman'), (Flow.Label.END_USER, 'End User'),
             (Flow.Label.IMPLEMENTING_PARTNER, 'Implementing Partner'))


class DistributionPlanNode(Runnable):
    distribution_plan = models.ForeignKey('DistributionPlan', null=True, blank=True)
    programme = models.ForeignKey(Programme, null=True, blank=True, related_name='nodes')
    item = models.ForeignKey('OrderItem')
    tree_position = models.CharField(max_length=255, choices=positions)
    balance = models.IntegerField(null=True, blank=True, default=0)
    acknowledged = models.IntegerField(null=True, blank=True, default=0)
    parents = None
    quantity = None
    objects = DeliveryNodeManager()

    def save(self, *args, **kwargs):
        _is_root = self.is_root()
        if self.parents or self.parents == []:
            self._update_arcs()
            _is_root = False
        if self.quantity >= 0 and _is_root:
            self._update_root_node_arc()
        if self.id and self.quantity_in() == 0 and self.track:
            self.delete()
            return self
        if _is_root:
            self.balance = self.acknowledged - self.quantity_out() if self.acknowledged else 0
        else:
            self.balance = self.quantity_in() - self.quantity_out()

        self.programme = self.get_programme()

        self.total_value = self._get_total_value()
        self.assign_ip()
        self._set_delivery()

        super(DistributionPlanNode, self).save(*args, **kwargs)

        parents = self.get_parents()
        self._update_parent_balances(parents)
        self._update_distribution_plan()
        if len(parents) > 0:
            self.distribution_expired_resolve_alert_if_exist(distribution_plan_id=parents[0].distribution_plan_id)

    @staticmethod
    def distribution_expired_resolve_alert_if_exist(distribution_plan_id, remarks='The IP has distributed!'):
        from eums.models import Alert
        alerts = Alert.objects.filter(Q(runnable_id=distribution_plan_id),
                                      Q(issue=Alert.ISSUE_TYPES.distribution_expired))
        for alert in alerts:
            alert.remarks = remarks
            alert.is_resolved = True
            alert.save()

    def _update_distribution_plan(self):
        if self.is_root() and self.distribution_plan:
            self.distribution_plan.update_total_value_and_ip(self.ip)

    def get_programme(self):
        if self.distribution_plan:
            return self.distribution_plan.programme
        else:
            first_parent = self.get_parents().first()
            return first_parent.get_programme() if first_parent else None

    def assign_ip(self):
        parent = self.get_parents().first()
        self.ip = parent.ip if parent else self.consignee

    def delete(self, using=None):
        parents = list(self.get_parents())
        super(DistributionPlanNode, self).delete(using=using)
        self._update_parent_balances(parents)

    def quantity_in(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_in.all(), 0)

    def quantity_out(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_out.all(), 0)

    def get_ip(self):
        if self.distribution_plan:
            root_node = DistributionPlanNode.objects.root_nodes_for(delivery=self.distribution_plan).first()
        elif self.parents:
            root_node = DistributionPlanNode.objects.filter(pk__in=self.parents, parents=None).first()
        else:
            root_node = self

        if root_node:
            return {'id': root_node.id, 'consignee': root_node.consignee, 'location': root_node.location}
        return self.get_parents().first().get_ip()

    def sender_name(self):
        return "UNICEF" if self.is_root() else self.get_parents().first().consignee.name

    def get_description(self):
        return self.item.item.description

    def children(self):
        children_ids = self.arcs_out.all().values_list('target_id')
        nodes = DistributionPlanNode.objects.filter(pk__in=children_ids)
        return nodes

    def has_children(self):
        return bool(self.children().count())

    def time_limitation_on_distribution(self):
        return self.distribution_plan.time_limitation_on_distribution

    def tracked_date(self):
        return self.distribution_plan.tracked_date

    def _set_delivery(self):
        parents = self.get_parents()
        if parents and parents.count() == 1:
            parent = parents.first()
            self.distribution_plan = parent.distribution_plan

    @classmethod
    def get_delivery_for(cls, release_order_item):
        first_node = cls.objects.filter(item=release_order_item, arcs_in__source__isnull=True).first()
        return getattr(first_node, 'distribution_plan', None)

    def is_root(self):
        if not self.arcs_in.exists():
            return True
        return not self.arcs_in.first().source

    def update_tracked_status(self):
        if not self.is_root():
            self.track = self.arcs_in.filter(source__track=True).exists()
            self.save()


    def update_balance(self):
        if self.is_root:
            self.balance = self.acknowledged - self.quantity_out() if self.acknowledged else 0
        else:
            self.balance = self.quantity_in() - self.quantity_out()
        self.save()

    @staticmethod
    def _update_parent_balances(parents):
        for parent in parents:
            parent.update_balance()

    def _update_arcs(self):
        self.arcs_in.all().delete()
        for parent_dict in self.parents:
            Arc.objects.create(target=self, source_id=parent_dict['id'], quantity=parent_dict['quantity'])

    def _update_root_node_arc(self):
        arc = Arc.objects.get(target=self)
        arc.quantity = self.quantity
        arc.save()

    def get_parents(self):
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

    def is_end_user(self):
        return self.tree_position == Flow.Label.END_USER

    def flow(self):
        if self.is_end_user():
            return Flow.objects.get(label=self.tree_position)
        return Flow.objects.get(label=Flow.Label.MIDDLE_MAN)

    def _get_total_value(self):
        return self.item.unit_value() * self.quantity_in()

    def lineage(self):
        return self._get_parent_lineage(self, [])

    def _get_parent_lineage(self, node, parent_list):
        if node.is_root():
            return parent_list
        else:
            if node is not self:
                parent_list.append(node)
            source_ids = node.arcs_in.all().values_list('source_id')
            parents = DistributionPlanNode.objects.filter(pk__in=source_ids)
            for parent in parents:
                return self._get_parent_lineage(parent, parent_list)
