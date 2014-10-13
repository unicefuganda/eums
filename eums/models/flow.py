from django.db import models
from djorm_pgarray.fields import IntegerArrayField

from eums.models import Question, DistributionPlanNode as Node, Option


class Flow(models.Model):
    rapid_pro_id = models.IntegerField()
    questions = models.ManyToManyField(Question)
    end_nodes = IntegerArrayField(dimension=2)
    for_node_type = models.CharField(
        max_length=255, choices=((Node.END_USER, 'End user'), (Node.MIDDLE_MAN, 'Middleman')), unique=True)

    def is_end(self, answer):
        question_id = answer.question.id
        value_id = answer.value.id if type(answer.value) is Option else None
        return self.end_nodes and [question_id, value_id] in self.end_nodes
