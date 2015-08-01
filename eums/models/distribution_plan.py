from django.db import models

from eums.models import MultipleChoiceAnswer
from eums.models import Runnable, DistributionPlanNode
from eums.models.programme import Programme


class DistributionPlan(Runnable):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def sender_name(self):
        return "UNICEF"

    def get_description(self):
        return "delivery"

    def is_received(self):
        answer = MultipleChoiceAnswer.objects.filter(run__runnable__id=self.id,
                                                     question__label='deliveryReceived').first()
        return answer.value.text == 'Yes'

    def total_value(self):
        delivery_root_nodes = DistributionPlanNode.objects.root_nodes_for(delivery=self)
        return reduce(lambda total, node: total + node.item.unit_value() * node.quantity_in(), delivery_root_nodes, 0)

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))
