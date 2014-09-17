from django.db import models

from eums.models.consignee import Consignee
from eums.models.item import Item


class DistributionPlanNode(models.Model):
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    under_current_supply_plan = models.BooleanField(default=True)
    planned_distribution_date = models.DateField()
    consignee = models.ForeignKey(Consignee)
    destination_location = models.CharField(max_length=255)
    remark = models.TextField()

    class Meta:
        app_label = 'eums'