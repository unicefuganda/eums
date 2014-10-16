from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from eums.models import SalesOrderItem, Consignee, DistributionPlanNode


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(SalesOrderItem)
    targeted_quantity = models.IntegerField()
    planned_distribution_date = models.DateField()
    remark = models.TextField()
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def current_run(self):
        return self.nodelineitemrun_set.filter(Q(status='scheduled')).first()

    def completed_run(self):
        return self.nodelineitemrun_set.filter(Q(status='completed')).first()

    def __str__(self):
        return "%s %s %s" % (self.item, str(self.planned_distribution_date), self.distribution_plan_node)