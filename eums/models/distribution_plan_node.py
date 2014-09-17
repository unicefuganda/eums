from django.db import models


class DistributionPlanNode(models.Model):
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')

    class Meta:
        app_label = 'eums'
