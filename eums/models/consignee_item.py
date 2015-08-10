from django.db import models
from djorm_pgarray.fields import IntegerArrayField


class ConsigneeItem(models.Model):
    consignee = models.ForeignKey('Consignee')
    item = models.ForeignKey('Item')
    amount_received = models.BigIntegerField(default=0)
    amount_distributed = models.BigIntegerField(default=0)
    deliveries = IntegerArrayField(dimension=1)

    class Meta:
        unique_together = ('consignee', 'item')

    def latest_delivery(self):
        pass

    def save(self, **kwargs):
        super(ConsigneeItem, self).save(**kwargs)
        if not len(self.deliveries):
            self.delete()
        return self
