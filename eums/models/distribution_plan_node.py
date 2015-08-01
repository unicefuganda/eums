from django.db import models, IntegrityError
from polymorphic import PolymorphicManager

from eums.models import Runnable, Arc

positions = ((Runnable.MIDDLE_MAN, 'Middleman'), (Runnable.END_USER, 'End User'),
             (Runnable.IMPLEMENTING_PARTNER, 'Implementing Partner'))


class DeliveryNodeManager(PolymorphicManager):
    def create(self, **kwargs):
        quantity = kwargs.pop('quantity') if 'quantity' in kwargs else None
        parents = kwargs.pop('parents') if 'parents' in kwargs else None
        if not parents and not quantity >= 0:
            raise IntegrityError('both parents and quantity cannot be null')
        node = super(DeliveryNodeManager, self).create(**kwargs)
        self._create_arcs(node, parents, quantity)
        return node

    def root_nodes_for(self, delivery):
        return self.model.objects.filter(distribution_plan=delivery, arcs_in__source__isnull=True)

    @staticmethod
    def _create_arcs(node, parents, quantity):
        if parents and len(parents):
            if type(parents[0]) == dict:
                for parent_dict in parents:
                    Arc.objects.create(target=node, source_id=parent_dict['id'], quantity=parent_dict['quantity'])
            elif type(parents[0]) == tuple:
                for parent_tuple in parents:
                    Arc.objects.create(target=node, source=parent_tuple[0], quantity=parent_tuple[1])
        elif quantity:
            Arc.objects.create(target=node, quantity=quantity)


class DistributionPlanNode(Runnable):
    distribution_plan = models.ForeignKey('DistributionPlan')
    item = models.ForeignKey('OrderItem')
    tree_position = models.CharField(max_length=255, choices=positions)
    parents = None
    quantity = None
    objects = DeliveryNodeManager()

    def save(self, *args, **kwargs):
        if self.parents or self.parents == []:
            self._update_arcs()
        if self.quantity >= 0 and self._is_root_node():
            self._update_root_node_arc()
        super(DistributionPlanNode, self).save(*args, **kwargs)

    def quantity_in(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_in.all(), 0)

    def quantity_out(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_out.all(), 0)

    def balance(self):
        return self.quantity_in() - self.quantity_out()

    def get_ip(self):
        root_node = DistributionPlanNode.objects.root_nodes_for(self.distribution_plan).first()
        return {'id': root_node.id, 'location': root_node.location}

    def sender_name(self):
        if not self.parent:
            return "UNICEF"
        else:
            return self.parent.consignee.name

    def get_description(self):
        return self.item.item.description

    def _update_arcs(self):
        self.arcs_in.all().delete()
        for parent_dict in self.parents:
            Arc.objects.create(target=self, source_id=parent_dict['id'], quantity=parent_dict['quantity'])

    def _update_root_node_arc(self):
        arc = Arc.objects.get(target=self)
        arc.quantity = self.quantity
        arc.save()

    def _is_root_node(self):
        return self.arcs_in.exists() and not self.arcs_in.first().source

    def __unicode__(self):
        return "%s %s %s %s" % (self.consignee.name, self.tree_position, str(self.distribution_plan), self.item)
