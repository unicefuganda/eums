import datetime
from django.db import models
from django.db.models import Q, Max
from eums import settings
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import Runnable


class RunQueue(models.Model):
    STATUS = Choices('not_started', 'started')
    runnable = models.ForeignKey(Runnable)
    contact_person_id = models.CharField(max_length=255)
    status = StatusField()
    run_delay = models.DecimalField(decimal_places=1, max_digits=12)
    start_time = models.DateTimeField(null=True)

    class Meta:
        app_label = 'eums'

    @classmethod
    def enqueue(cls, runnable, days_delay):
        if not RunQueue.objects.filter(runnable=runnable, contact_person_id=runnable.contact_person_id,
                                       status=RunQueue.STATUS.not_started).exists():
            expected_delivery_date = datetime.datetime.combine(runnable.delivery_date,
                                                               datetime.datetime.min.time())
            start_time = expected_delivery_date + datetime.timedelta(days=days_delay)
            delay_seconds = (start_time - datetime.datetime.now()).total_seconds()
            run_delay = delay_seconds if delay_seconds > 0 else settings.DELIVERY_BUFFER_IN_SECONDS
            cls.objects.create(runnable=runnable, status=RunQueue.STATUS.not_started,
                               contact_person_id=runnable.contact_person_id,
                               run_delay=run_delay, start_time=start_time)

    @classmethod
    def dequeue(cls, contact_person_id):
        return cls.objects.filter(Q(contact_person_id=contact_person_id) & Q(status='not_started')).order_by(
                'start_time', 'id').first()

    def update_status(self, status):
        self.status = status
        self.save()
