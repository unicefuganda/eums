from django.db import models
from django.db.models import Q

from eums.models import MultipleChoiceAnswer, PurchaseOrderItem
from eums.models import Runnable, DistributionPlanNode
from eums.models.programme import Programme


class DistributionPlan(Runnable):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def save(self, *args, **kwargs):
        super(DistributionPlan, self).save(*args, **kwargs)
        DistributionPlanNode.objects.filter(distribution_plan=self).update(track=self.track)

    def total_value(self):
        delivery_root_nodes = DistributionPlanNode.objects.root_nodes_for(delivery=self)
        return reduce(lambda total, node: total + node.item.unit_value() * node.quantity_in(), delivery_root_nodes, 0)

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))

    def is_received(self):
        answer = MultipleChoiceAnswer.objects.filter(Q(run__runnable__id=self.id),
                                                     Q(question__label='deliveryReceived'),
                                                     ~ Q(run__status='cancelled')).first()

        return answer and answer.value.text == 'Yes'

    def type(self):
        delivery_node = DistributionPlanNode.objects.filter(distribution_plan=self).first()

        if delivery_node:
            return 'Purchase Order' if isinstance(delivery_node.item, PurchaseOrderItem) else 'Waybill'
        return 'Unknown'

    def number(self):
        delivery_node = DistributionPlanNode.objects.filter(distribution_plan=self).first()
        return delivery_node.item.number() if delivery_node and delivery_node.item else 'Unknown'

    def number_of_items(self):
        return DistributionPlanNode.objects.filter(distribution_plan=self).count()
