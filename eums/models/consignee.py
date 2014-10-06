from django.db import models
import requests
from django.conf import settings


class Consignee(models.Model):
    name = models.CharField(max_length=255)
    contact_person_id = models.CharField(max_length=255)
    contact = None

    def build_contact(self):
        if not self.contact:
            response = requests.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, self.contact_person_id))
            self.contact = response.json()
        return self.contact

    def get_current_line_item_run(self):
        for node in self.distributionplannode_set.all():
            for line_item in node.distributionplanlineitem_set.all():
                current_run = line_item.current_node_line_item_run()
                if current_run:
                    return current_run
        return None

    def __str__(self):
        return self.name

    @staticmethod
    def get_consignees_with_phone(phone_number):
        response = requests.get(
            "%s?searchfield=%s/" % (settings.CONTACTS_SERVICE_URL, phone_number.replace('+', '%2B'))
        )
        if response.status_code == 200:
            contact_ds = map(lambda contact: contact['_id'], response.json())
            return Consignee.objects.filter(contact_person_id__in=contact_ds)
        return []

    class Meta:
        app_label = 'eums'