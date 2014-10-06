from django.db import models
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import DistributionPlanLineItem


class NodeLineItemRun(models.Model):
    STATUS = Choices('not_started', 'in_progress', 'completed', 'expired')
    scheduled_message_task_id = models.CharField(max_length=255)
    node_line_item = models.ForeignKey(DistributionPlanLineItem)
    status = StatusField()

    class Meta:
        app_label = 'eums'
