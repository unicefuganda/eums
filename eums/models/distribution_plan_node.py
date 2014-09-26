from django.db import models

from eums.models import DistributionPlan, Consignee


class DistributionPlanNode(models.Model):
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)
    consignee = models.ForeignKey(Consignee)
    scheduled_message_task_id = models.CharField(null=True, blank=True, max_length=255)

    class Meta:
        app_label = 'eums'
        unique_together = ('distribution_plan', 'consignee')
