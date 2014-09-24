from django.db import models
import requests
from eums.settings import CONTACTS_SERVICE_URL


class Consignee(models.Model):
    name = models.CharField(max_length=255)
    contact_person_id = models.CharField(max_length=255)
    contact = None

    def build_contact(self):
        if not self.contact:
            response = requests.get("%s%s/" % (CONTACTS_SERVICE_URL, self.contact_person_id))
            self.contact = response.json()
        return self.contact

    class Meta:
        app_label = 'eums'