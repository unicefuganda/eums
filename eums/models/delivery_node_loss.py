from django.db import models

from eums.models import DistributionPlanNode


class DeliveryNodeLoss(models.Model):
    quantity = models.IntegerField(null=False)
    remark = models.CharField(max_length=255)
    delivery_node = models.ForeignKey(DistributionPlanNode, related_name='losses')
