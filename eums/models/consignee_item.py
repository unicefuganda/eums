from django.db import models
from djorm_pgarray.fields import IntegerArrayField
from eums.models import DistributionPlanNode


class ConsigneeItem(models.Model):
    consignee = models.ForeignKey('Consignee')
    item = models.ForeignKey('Item')
    amount_received = models.BigIntegerField(default=0)
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

    def available_balance(self):
        deliveries = DistributionPlanNode.objects.filter(pk__in=self.deliveries, consignee=self.consignee)
        total_amount_lost = reduce(lambda total, delivery: total + delivery.total_amount_lost(), deliveries, 0)
        amount_distributed = reduce(lambda total, delivery: total + delivery.quantity_out(), deliveries, 0)
        return self.amount_received - amount_distributed - total_amount_lost
