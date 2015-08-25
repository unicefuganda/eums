from django.db import models, IntegrityError


class Arc(models.Model):
    source = models.ForeignKey('DistributionPlanNode', null=True, blank=True, related_name='arcs_out')
    target = models.ForeignKey('DistributionPlanNode', related_name='arcs_in')
    quantity = models.IntegerField()

    def save(self, **kwargs):
        quantity_is_invalid = self.source and self._source_balance() < self.quantity
        arc_is_cyclic = self.source and self.source.id == self.target.id
        if arc_is_cyclic:
            raise IntegrityError('Arc source node cannot be the same as target')
        if quantity_is_invalid:
            raise IntegrityError('Arc quantity cannot be more than available quantity on source node')
        super(Arc, self).save(kwargs)

    def _source_balance(self):
        return self.source.quantity_in() - self.source.quantity_out()
