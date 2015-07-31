from django.db import models, IntegrityError
from polymorphic import PolymorphicManager

from eums.models import DistributionPlan, Runnable, Arc


class DeliveryNodeManager(PolymorphicManager):
    def create(self, **kwargs):
        quantity = kwargs.pop('quantity') if 'quantity' in kwargs else None
        parents = kwargs.pop('parents') if 'parents' in kwargs else None
        if not parents and not quantity >= 0:
            raise IntegrityError('both parents and quantity cannot be null')
        node = super(DeliveryNodeManager, self).create(**kwargs)
        self._create_arcs(node, parents, quantity)
        return node

    @staticmethod
    def _create_arcs(node, parents, quantity):
        if parents and len(parents):
            for parent_dict in parents:
                Arc.objects.create(target=node, source_id=parent_dict['id'], quantity=parent_dict['quantity'])
        elif quantity:
            Arc.objects.create(target=node, quantity=quantity)


class DistributionPlanNode(Runnable):
    distribution_plan = models.ForeignKey(DistributionPlan)
    item = models.ForeignKey('OrderItem')
    tree_position = models.CharField(max_length=255,
                                     choices=((Runnable.MIDDLE_MAN, 'Middleman'), (Runnable.END_USER, 'End User'),
                                              (Runnable.IMPLEMENTING_PARTNER, 'Implementing Partner')))
    objects = DeliveryNodeManager()

    def quantity_in(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_in.all(), 0)

    def quantity_out(self):
        return reduce(lambda total, arc: total + arc.quantity, self.arcs_out.all(), 0)

    def balance(self):
        return self.quantity_in() - self.quantity_out()

    def get_ip(self):
        if not self.parent:
            return {'id': self.id, 'location': self.location}
        else:
            return self.parent.get_ip()

    def sender_name(self):
        if not self.parent:
            return "UNICEF"
        else:
            return self.parent.consignee.name

    def get_description(self):
        return self.item.item.description

    def __unicode__(self):
        return "%s %s %s %s" % (self.consignee.name, self.tree_position, str(self.distribution_plan), self.item)


