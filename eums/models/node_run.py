from django.db import models
from eums.models import DistributionPlanNode


class NodeRun(models.Model):
    scheduled_message_task_id = models.CharField(max_length=255)
    node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'
