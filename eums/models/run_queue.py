from django.db import models
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import DistributionPlanLineItem, Consignee


class RunQueue(models.Model):
    STATUS = Choices('not_started', 'started')
    node_line_item = models.ForeignKey(DistributionPlanLineItem)
    contact_person_id = models.CharField(max_length=255)
    status = StatusField()
    start_run_date = models.DateTimeField()

    class Meta:
        app_label = 'eums'