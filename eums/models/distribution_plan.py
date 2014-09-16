from django.db import models

from eums.models.distribution_plan_line_item import DistributionPlanLineItem
from eums.models.programme import Programme


class DistributionPlan(models.Model):
    programme = models.ForeignKey(Programme)
    line_items = models.ManyToManyField(DistributionPlanLineItem)

    class Meta:
        app_label = 'eums'