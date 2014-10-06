from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import DistributionPlanLineItem


class RunQueue(models.Model):
    STATUS = Choices('not_started', 'started')
    node_line_item = models.ForeignKey(DistributionPlanLineItem)
    contact_person_id = models.CharField(max_length=255)
    status = StatusField()
    start_run_date = models.DateTimeField()

    class Meta:
        app_label = 'eums'

    @classmethod
    def enqueue(cls, node_line_item, start_run_date):
        queued_run = RunQueue(node_line_item=node_line_item, status=RunQueue.STATUS.not_started,
                              contact_person_id=node_line_item.distribution_plan_node.consignee.contact_person_id,
                              start_run_date=start_run_date)
        queued_run.save()

    @classmethod
    def deque(cls, contact_person_id):
        not_started_runs = RunQueue.objects.filter(Q(contact_person_id=contact_person_id) & Q(status='not_started')).\
            order_by('start_run_date')
        if len(not_started_runs):
            return not_started_runs[0]
        return None
