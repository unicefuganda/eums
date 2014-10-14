from django.db import models

from eums.models.programme import Programme


class DistributionPlan(models.Model):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def __str__(self):
        return "%s, %s" % (self.programme.name, str(self.date))

