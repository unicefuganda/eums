from django.db import models

from eums.models import Runnable
from eums.models.programme import Programme


class DistributionPlan(Runnable):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))
