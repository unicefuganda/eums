from django.db import models
from django.forms import model_to_dict
from model_utils import Choices
from model_utils.fields import StatusField
from django.contrib.auth.models import User
from eums.models.time_stamped_model import TimeStampedModel


class Consignee(TimeStampedModel):
    TYPES = Choices('implementing_partner', 'middle_man', 'end_user')
    name = models.CharField(max_length=255)
    customer_id = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    type = StatusField(choices_name='TYPES')
    imported_from_vision = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    created_by_user = models.ForeignKey(User, editable=False, null=True)

    def has_only_dirty_remarks(self, new_attributes):
        editable_fields = model_to_dict(self)
        for key, value in new_attributes.iteritems():
            if key != 'remarks' and key in editable_fields:
                if editable_fields[key] != value:
                    return False
        return True

    def __unicode__(self):
        return '%s' % self.name
