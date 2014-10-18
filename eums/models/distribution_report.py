from django.db import models

from eums.models import Consignee, Programme


class DistributionReport(models.Model):
    consignee = models.ForeignKey(Consignee)
    programme = models.ForeignKey(Programme)
    total_received_with_quality_issues = models.IntegerField()
    total_received_with_quantity_issues = models.IntegerField()
    total_received_without_issues = models.IntegerField()
    total_not_received = models.IntegerField()
    total_distributed_with_quality_issues = models.IntegerField()
    total_distributed_with_quantity_issues = models.IntegerField()
    total_distributed_without_issues = models.IntegerField()
    total_not_distributed = models.IntegerField()

    def __str__(self):
        return '%s, %s' % (self.consignee.name, self.programme.name)