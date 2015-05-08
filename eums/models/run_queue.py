from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import DistributionPlanNode


class RunQueue(models.Model):
    STATUS = Choices('not_started', 'started')
    node = models.ForeignKey(DistributionPlanNode)
    contact_person_id = models.CharField(max_length=255)
    status = StatusField()
    run_delay = models.DecimalField(decimal_places=1, max_digits=12)

    class Meta:
        app_label = 'eums'

    @classmethod
    def enqueue(cls, node, run_delay):
        cls.objects.create(node=node, status=RunQueue.STATUS.not_started,
                           contact_person_id=node.contact_person_id,
                           run_delay=run_delay)

    @classmethod
    def dequeue(cls, contact_person_id):
        return cls.objects.filter(Q(contact_person_id=contact_person_id) & Q(status='not_started')). \
            order_by('-run_delay').first()