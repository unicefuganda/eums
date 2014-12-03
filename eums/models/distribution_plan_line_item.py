from django.db import models

from eums.models import SalesOrderItem, DistributionPlanNode


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(SalesOrderItem)
    targeted_quantity = models.IntegerField()
    track = models.BooleanField(default=False)
    planned_distribution_date = models.DateField()
    remark = models.TextField(blank=True, null=True)
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def current_run(self):
        return self.nodelineitemrun_set.filter(status='scheduled').first()

    def completed_run(self):
        return self.nodelineitemrun_set.filter(status='completed').first()

    def latest_run(self):
        return self.nodelineitemrun_set.all().last()

    def __unicode__(self):
        return "%s %s" % ( str(self.planned_distribution_date), self.distribution_plan_node)