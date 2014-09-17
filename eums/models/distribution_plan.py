from django.db import models

from eums.models.distribution_plan_node import DistributionPlanNode
from eums.models.programme import Programme


class DistributionPlan(models.Model):
    programme = models.ForeignKey(Programme)
    line_items = models.ManyToManyField(DistributionPlanNode)

    class Meta:
        app_label = 'eums'