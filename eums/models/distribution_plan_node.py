from django.db import models

from eums.models import DistributionPlan, Consignee


class DistributionPlanNode(models.Model):
    MIDDLE_MAN = 'MIDDLE_MAN'
    END_USER = 'END_USER'
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    distribution_plan = models.ForeignKey(DistributionPlan)
    consignee = models.ForeignKey(Consignee)
    tree_position = models.CharField(max_length=255, choices=((MIDDLE_MAN, 'Middleman'), (END_USER, 'End User')))

    class Meta:
        app_label = 'eums'
        unique_together = ('distribution_plan', 'consignee')

    def __str__(self):
        return "%s %s %s " % (self.consignee.name, self.tree_position, str(self.distribution_plan))