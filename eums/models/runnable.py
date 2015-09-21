from django.conf import settings
from django.db import models
from polymorphic import PolymorphicModel
import requests
from eums.models import Consignee
from eums.services.contacts import ContactService


class Runnable(PolymorphicModel):
    location = models.CharField(max_length=255)
    consignee = models.ForeignKey(Consignee)
    ip = models.ForeignKey(Consignee, null=True, blank=True, related_name='runnables')
    contact_person_id = models.CharField(max_length=255)
    track = models.BooleanField(default=False)
    delivery_date = models.DateField(null=False)
    remark = models.TextField(blank=True, null=True)

    IMPLEMENTING_PARTNER = 'IMPLEMENTING_PARTNER'
    WEB = 'WEB'
    MIDDLE_MAN = 'MIDDLE_MAN'
    END_USER = 'END_USER'

    def build_contact(self):
        try:
            response = requests.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, self.contact_person_id))
            return response.json() if response.status_code is 200 else {}
        except:
            return {}

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

    @property
    def contact(self):
        contact = self.build_contact()
        return ContactService(**contact)

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
            contact_name=self.contact.full_name(),
            item_description=self.item_description(),
            issue=issue)
