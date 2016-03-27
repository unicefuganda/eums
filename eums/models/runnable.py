import logging

import requests
from django.conf import settings
from django.db import models
from django.db.models import Q
from polymorphic import PolymorphicModel

from eums.models import Consignee
from eums.models.time_stamped_model import TimeStampedModel

from eums.services.contacts import Contacts
from eums.services.contact_service import ContactService

logger = logging.getLogger(__name__)


class Runnable(PolymorphicModel, TimeStampedModel):
    location = models.CharField(max_length=255, null=True)
    consignee = models.ForeignKey(Consignee)
    ip = models.ForeignKey(Consignee, null=True, blank=True, related_name='runnables')
    contact_person_id = models.CharField(max_length=255, null=True)
    track = models.BooleanField(default=False)
    delivery_date = models.DateField(null=False)
    remark = models.TextField(blank=True, null=True)
    is_retriggered = models.BooleanField(default=False)
    total_value = models.DecimalField(max_digits=12, decimal_places=2, null=False, default=0)
    is_auto_track_confirmed = models.NullBooleanField(null=True)
    is_assigned_to_self = models.NullBooleanField(null=True)

    IMPLEMENTING_PARTNER = 'IMPLEMENTING_PARTNER'
    WEB = 'WEB'
    MIDDLE_MAN = 'MIDDLE_MAN'
    END_USER = 'END_USER'

    def build_contact(self):
        logger.info('contact person id = %s' % self.contact_person_id)
        return ContactService.get(self.contact_person_id)

    def ready_to_start_run(self):
        return self.run_set.filter(status='not_started').first()

    def current_run(self):
        return self.run_set.filter(status='scheduled').first()

    def completed_run(self):
        return self.run_set.filter(status='completed').order_by('-modified').first()

    def latest_run(self):
        return self.run_set.all().last()

    def _completed_runs(self):
        return self.run_set.filter(status='completed')

    def responses(self):
        return dict(map(lambda run: (run, run.answers()), self.run_set.filter(Q(status='scheduled') |
                                                                              Q(status='completed'))))

    def latest_response(self):
        latest_run = self.latest_run()
        if latest_run:
            answers = latest_run.answers()
            if answers:
                sorted_answers = sorted(answers, key=lambda answer: answer.date_created, reverse=True)
                return sorted_answers[0]

    @property
    def contact(self):
        contact = self.build_contact()
        return Contacts(**contact)

    def number(self):
        pass

    def type(self):
        pass

    def item_description(self):
        return None

    def create_alert(self, issue):
        self.alert_set.create(
            order_type=self.type(),
            order_number=self.number(),
            consignee_name=self.consignee.name,
            item_description=self.item_description(),
            issue=issue)
