from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from eums.models import SalesOrderItem, Consignee, DistributionPlanNode


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(SalesOrderItem)
    targeted_quantity = models.IntegerField()
    planned_distribution_date = models.DateField()
    programme_focal = models.ForeignKey(User)
    consignee = models.ForeignKey(Consignee)
    contact_person = models.CharField(max_length=255)
    contact_phone_number = models.CharField(max_length=255)
    destination_location = models.CharField(max_length=255)
    mode_of_delivery = models.CharField(max_length=255)
    tracked = models.BooleanField(default=False)
    remark = models.TextField()
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def current_run(self):
        runs = self.nodelineitemrun_set.filter(Q(status='not_started') | Q(status='in_progress'))
        if len(runs):
            return runs[0]
        return None
