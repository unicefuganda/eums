from django.db import models
from eums.models import DistributionPlanNode as DeliveryNode


class Arc(models.Model):
    source = models.ForeignKey(DeliveryNode, null=True, blank=True, related_name='arcs_out')
    target = models.ForeignKey(DeliveryNode, related_name='arcs_in')
    quantity = models.IntegerField()
