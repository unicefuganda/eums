from django.db import models

from eums.models.distribution_plan_item import DistributionPlanItem
from eums.models.programme import Programme


class DistributionPlan(models.Model):
    programme = models.ForeignKey(Programme)
    items = models.ManyToManyField(DistributionPlanItem)

    class Meta:
        app_label = 'eums'