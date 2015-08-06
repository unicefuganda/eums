from django.db import models
from eums.models import ItemUnit, DistributionPlanNode


class ItemManager(models.Manager):
    def delivered_to_consignee(self, consignee):
        item_ids = DistributionPlanNode.objects.filter(consignee=consignee).distinct('item__item') \
            .values_list('item__item__id')
        return self.model.objects.filter(pk__in=item_ids)


class Item(models.Model):
    description = models.CharField(max_length=255)
    material_code = models.CharField(max_length=255)
    unit = models.ForeignKey(ItemUnit, null=True)
    objects = ItemManager()

    class Meta:
        app_label = 'eums'
        unique_together = ('description', 'material_code')

    def __unicode__(self):
        return '%s' % self.description
