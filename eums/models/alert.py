from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField
from eums.models import Runnable, PurchaseOrderItem, ReleaseOrderItem


class Alert(models.Model):
    ORDER_TYPES = Choices(ReleaseOrderItem.WAYBILL, PurchaseOrderItem.PURCHASE_ORDER)
    ISSUE_TYPES = Choices(('not_received', 'Not Received'), ('bad_condition', 'In Bad Condition'),
                          ('damaged', 'Damaged'), ('substandard', 'Substandard'), ('expired', 'Expired'),
                          ('incomplete', 'Incomplete'), ('not_satisfied', 'Not Satisfied'))

    order_type = StatusField(choices_name='ORDER_TYPES')
    order_number = models.IntegerField()
    issue = StatusField(choices_name='ISSUE_TYPES')
    is_resolved = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    consignee_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    created_on = models.DateField(auto_now_add=True)
    runnable = models.ForeignKey(Runnable)
    item_description = models.CharField(max_length=255, null=True)

    def order_type_display_name(self):
        return self.ORDER_TYPES[self.order_type]

    def issue_display_name(self):
        return self.ISSUE_TYPES[self.issue]

    class Meta:
        ordering = ['-created_on']