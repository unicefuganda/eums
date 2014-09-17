from django.db import models
from eums.models import DistributionPlan


class DistributionPlanNode(models.Model):
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)

    class Meta:
        app_label = 'eums'
