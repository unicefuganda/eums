from django.db import models
from eums.models import DistributionPlanNode

from eums.models.consignee import Consignee
from eums.models.item import Item


class DistributionPlanLineItem(models.Model):
    item = models.ForeignKey(Item)
    quantity = models.IntegerField()
    under_current_supply_plan = models.BooleanField(default=True)
    planned_distribution_date = models.DateField()
    consignee = models.ForeignKey(Consignee)
    destination_location = models.CharField(max_length=255)
    remark = models.TextField()
    distribution_plan_node = models.ForeignKey(DistributionPlanNode)

    class Meta:
        app_label = 'eums'