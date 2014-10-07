from django.db import models
from django.db.models import Q

from eums.models import DistributionPlanNode
from eums.models.item import Item


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    under_current_supply_plan = models.BooleanField(default=True)
    planned_distribution_date = models.DateField()
    destination_location = models.CharField(max_length=255)
    remark = models.TextField()
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'

    def current_run(self):
        runs = self.nodelineitemrun_set.filter(Q(status='not_started') | Q(status='in_progress'))
        if len(runs):
            return runs[0]
        return None
