from django.db import models


class ConsigneeItem(models.Model):
    consignee = models.ForeignKey('Consignee')
    item = models.ForeignKey('Item')
    received = models.BigIntegerField()
    distributed = models.BigIntegerField()
    latest_delivery = models.ForeignKey('DistributionPlanNode')

    class Meta:
        unique_together = ('consignee', 'item')
