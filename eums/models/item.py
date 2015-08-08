from django.db import models

from eums.models import ItemUnit, DistributionPlanNode, MultipleChoiceAnswer, MultipleChoiceQuestion, Flow, \
    Runnable, Option


class ItemManager(models.Manager):
    def received_by_consignee(self, consignee):
        web_flow = Flow.objects.get(for_runnable_type=Runnable.WEB)
        was_item_received = MultipleChoiceQuestion.objects.get(label='itemReceived', flow=web_flow)
        yes = Option.objects.get(text='Yes', question=was_item_received)
        was_item_received_answers = MultipleChoiceAnswer.objects.filter(question=was_item_received, value=yes,
                                                                        run__runnable__consignee=consignee)
        received_node_ids = was_item_received_answers.values_list('run__runnable_id')
        received_nodes = DistributionPlanNode.objects.filter(id__in=received_node_ids)
        item_ids = received_nodes.distinct('item__item').values_list('item__item__id')
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
