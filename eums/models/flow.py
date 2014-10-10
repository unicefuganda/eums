from django.db import models
from djorm_pgarray.fields import IntegerArrayField

from eums.models import Question, DistributionPlanNode as Node


class Flow(models.Model):
    rapid_pro_id = models.IntegerField()
    questions = models.ManyToManyField(Question)
    end_questions = IntegerArrayField(dimension=1)
    for_node_type = models.CharField(
        max_length=255, choices=((Node.END_USER, 'End user'), (Node.MIDDLE_MAN, 'Middleman')), unique=True)
