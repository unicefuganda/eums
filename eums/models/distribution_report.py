from django.db import models

from eums.models import Consignee, Programme


class DistributionReport(models.Model):
    consignee = models.ForeignKey(Consignee)
    programme = models.ForeignKey(Programme)
    total_received = models.IntegerField()
    total_distributed = models.IntegerField()
    total_not_received = models.IntegerField()

    class Meta:
        unique_together = ('consignee', 'programme')

    def __str__(self):
        return '%s, %s' % (self.consignee.name, self.programme.name)