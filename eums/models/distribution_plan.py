from django.db import models

from eums.models.programme import Programme


class DistributionPlan(models.Model):
    programme = models.ForeignKey(Programme)

    class Meta:
        app_label = 'eums'