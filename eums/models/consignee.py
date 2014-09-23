from django.db import models


class Consignee(models.Model):
    name = models.CharField(max_length=255)
    contact_person_id = models.CharField(max_length=255)

    def build_contact(self):
        return None

    class Meta:
        app_label = 'eums'
