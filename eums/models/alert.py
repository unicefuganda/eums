import datetime
from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField
from eums.models import Runnable, PurchaseOrderItem, ReleaseOrderItem, DistributionPlanNode, DistributionPlan, Question


class Alert(models.Model):
    class Meta:
        ordering = ['is_resolved', 'runnable__is_retriggered', '-created_on']

    ORDER_TYPES = Choices(ReleaseOrderItem.WAYBILL, PurchaseOrderItem.PURCHASE_ORDER)
    ISSUE_TYPES = Choices(('not_received', 'Not Received'), ('bad_condition', 'In Bad Condition'),
                          ('damaged', 'Damaged'), ('substandard', 'Substandard'), ('expired', 'Expired'),
                          ('incomplete', 'Incomplete'), ('not_satisfied', 'Not Satisfied'),
                          ('distribution_expired', 'Distribution Expired'))

    order_type = StatusField(choices_name='ORDER_TYPES')
    order_number = models.IntegerField()
    issue = StatusField(choices_name='ISSUE_TYPES')
    is_resolved = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    consignee_name = models.CharField(max_length=255)
    created_on = models.DateField(auto_now_add=True)
    runnable = models.ForeignKey(Runnable)
    item_description = models.CharField(max_length=255, null=True)

    def order_type_display_name(self):
        return self.ORDER_TYPES[self.order_type]

    def issue_display_name(self):
        return self.ISSUE_TYPES[self.issue]

    def total_value(self):
        return self.runnable.total_value

    def quantity_delivered(self):
        if isinstance(self.runnable, DistributionPlanNode):
            return self.runnable.quantity_in()

    def location(self):
        return self.runnable.location

    def date_shipped(self):
        return self.runnable.delivery_date

    @property
    def date_received(self):
        distribution_plan = DistributionPlan.objects.filter(id=self.runnable.id).first()
        return distribution_plan.received_date if distribution_plan else ''

    def runnable_id(self):
        return self.runnable.id

    def is_retriggered(self):
        return self.runnable.is_retriggered

    def resolve_retriggered_delivery(self):
        if not self.is_resolved:
            self.remarks = "delivery confirmed on %s" % datetime.date.today().strftime('%d-%b-%Y')
            self.is_resolved = True
            self.save()
