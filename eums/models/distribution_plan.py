from django.db import models

from eums.models.programme import Programme


class DistributionPlan(models.Model):
    name = models.CharField(max_length=255)
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'