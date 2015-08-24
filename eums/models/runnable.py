from django.conf import settings
from django.db import models
from polymorphic import PolymorphicModel
import requests
from eums.models import Consignee
from eums.services.contacts import ContactService


class Runnable(PolymorphicModel):
    location = models.CharField(max_length=255)
    consignee = models.ForeignKey(Consignee)
    contact_person_id = models.CharField(max_length=255)
    track = models.BooleanField(default=False)
    delivery_date = models.DateField(null=False)
    remark = models.TextField(blank=True, null=True)

    IMPLEMENTING_PARTNER = 'IMPLEMENTING_PARTNER'
    WEB = 'WEB'
    MIDDLE_MAN = 'MIDDLE_MAN'
    END_USER = 'END_USER'

    def build_contact(self):
        response = requests.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, self.contact_person_id))
        result = response.json() if response.status_code is 200 else None
        return result

    def current_run(self):
        return self.run_set.filter(status='scheduled').first()

    def completed_run(self):
        return self.run_set.filter(status='completed').first()

    def latest_run(self):
        return self.run_set.all().last()

    def _completed_runs(self):
        return self.run_set.filter(status='completed')

    def responses(self):
        return dict(map(lambda run: (run, run.answers()), self._completed_runs()))

    def _contact_name(self):
        contact = self.build_contact()
        return ContactService(**contact).full_name()

    def number(self):
        pass

    def type(self):
        pass

    def create_alert(self, issue):
        self.alert_set.create(
            order_type=self.type(),
            order_number=self.number(),
            consignee_name=self.consignee.name,
            contact_name=self._contact_name(),
            issue=issue)
