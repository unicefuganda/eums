from django.db import models


class Consignee(models.Model):
    name = models.CharField(max_length=255, blank=True)
    contact_person_id = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'
