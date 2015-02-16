from django.db import models
from djorm_pgarray.fields import IntegerArrayField

from eums.models import DistributionPlanNode as Node, Option


class Flow(models.Model):
    NO_OPTION = -1
    rapid_pro_id = models.IntegerField()
    end_nodes = IntegerArrayField(dimension=2)
    for_node_type = models.CharField(
        max_length=255, choices=((Node.END_USER, 'End User'), (Node.MIDDLE_MAN, 'Middleman'),
                                 (Node.IMPLEMENTING_PARTNER, 'Implementing Partner')), unique=True)

    def is_end(self, answer):
        question_id = answer.question.id
        value_id = answer.value.id if type(answer.value) is Option else self.NO_OPTION
        return self.end_nodes and [question_id, value_id] in self.end_nodes

    def __unicode__(self):
        return '%s' % str(self.for_node_type)