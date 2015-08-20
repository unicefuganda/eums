from django.contrib.auth.models import User
from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField
from eums.models import Runnable


class Alert(models.Model):

    ORDER_TYPES = Choices('waybill', 'purchase_order')
    ISSUE_TYPES = Choices('not_received', 'bad_condition')

    order_type = StatusField(choices_name='ORDER_TYPES')
    order_number = models.IntegerField(unique=True)
    issue = StatusField(choices_name='ISSUE_TYPES')
    is_resolved = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    consignee_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    delivery_sender = models.ForeignKey(User, editable=False)
    created_at = models.DateField(auto_now=True)
    runnable = models.ForeignKey(Runnable)