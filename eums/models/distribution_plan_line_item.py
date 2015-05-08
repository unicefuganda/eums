from django.db import models

from eums.models import DistributionPlanNode


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey('SalesOrderItem')
    targeted_quantity = models.IntegerField()
    track = models.BooleanField(default=False)
    planned_distribution_date = models.DateField()
    remark = models.TextField(blank=True, null=True)
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s %s" % ( str(self.planned_distribution_date), self.distribution_plan_node)