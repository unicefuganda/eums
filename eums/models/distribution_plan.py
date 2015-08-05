from django.db import models

from eums.models import MultipleChoiceAnswer
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

    def sender_name(self):
        return "UNICEF"

    def get_description(self):
        return "delivery"

    def total_value(self):
        delivery_root_nodes = DistributionPlanNode.objects.root_nodes_for(delivery=self)
        return reduce(lambda total, node: total + node.item.unit_value() * node.quantity_in(), delivery_root_nodes, 0)

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))

    def is_received(self):
        answer = MultipleChoiceAnswer.objects.filter(run__runnable__id=self.id,
                                                     question__label='deliveryReceived').first()
        if answer and answer.value.text == 'Yes':
            return True
        return False

