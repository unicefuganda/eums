from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField


class Consignee(models.Model):
    TYPES = Choices('implementing_partner', 'middle_man', 'end_user')
    name = models.CharField(max_length=255)
    customer_id = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    type = StatusField(choices_name='TYPES')
    imported_from_vision = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return '%s' % self.name
