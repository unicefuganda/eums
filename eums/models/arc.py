from django.db import models, IntegrityError
from eums.models import DistributionPlanNode as DeliveryNode


class Arc(models.Model):
    source = models.ForeignKey(DeliveryNode, null=True, blank=True, related_name='arcs_out')
    target = models.ForeignKey(DeliveryNode, related_name='arcs_in')
    quantity = models.IntegerField()

    def save(self, **kwargs):
        if self.source and self.source.id == self.target.id:
            raise IntegrityError('Arc source node cannot be the same as target')
        super(Arc, self).save(kwargs)
