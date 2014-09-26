from django.db import models

from eums.models import DistributionPlan, Consignee


class DistributionPlanNode(models.Model):
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)
    consignee = models.ForeignKey(Consignee)

    class Meta:
        app_label = 'eums'
        unique_together = ('distribution_plan', 'consignee')

    def current_node_run(self):
        runs = self.noderun_set.all()
        if len(runs):
            return runs[0]
        return None
