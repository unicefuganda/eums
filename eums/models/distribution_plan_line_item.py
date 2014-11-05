from django.db import models

from eums.models import SalesOrderItem, DistributionPlanNode


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(SalesOrderItem)
    targeted_quantity = models.IntegerField()
    planned_distribution_date = models.DateField()
    remark = models.TextField(blank=True, null=True)
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def current_run(self):
        return self.nodelineitemrun_set.filter(status='scheduled').first()

    def completed_run(self):
        return self.nodelineitemrun_set.filter(status='completed').first()

    def __unicode__(self):
        return "%s %s %s" % (self.item, str(self.planned_distribution_date), self.distribution_plan_node)