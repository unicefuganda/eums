from django.db.models.signals import post_delete
from django.dispatch import receiver

from eums.elasticsearch.delete_records import DeleteRecords
from eums.models import DistributionPlanNode as DeliveryNode, Run, TextAnswer, NumericAnswer, MultipleChoiceAnswer
from eums.models import DistributionPlan as Delivery


@receiver(post_delete, sender=DeliveryNode)
def on_delete_node(sender, **kwargs):
    node = kwargs['instance']
    delete_records = _get_or_create_delete_records()
    delete_records.nodes_to_delete.append(node.id)
    delete_records.save()


@receiver(post_delete, sender=Run)
def on_delete_run(sender, **kwargs):
    run = kwargs['instance']
    delete_records = _get_or_create_delete_records()
    if not Delivery.objects.filter(pk=run.runnable_id).exists():
        delete_records.nodes_with_deleted_dependencies.append(run.runnable_id)
        delete_records.save()


@receiver(post_delete, sender=TextAnswer)
def on_delete_text_answer(sender, **kwargs):
    answer = kwargs['instance']
    _mark_relevant_node_for_sync(answer)


@receiver(post_delete, sender=NumericAnswer)
def on_delete_numeric_answer(sender, **kwargs):
    answer = kwargs['instance']
    _mark_relevant_node_for_sync(answer)


@receiver(post_delete, sender=MultipleChoiceAnswer)
def on_delete_multiple_choice_answer(sender, **kwargs):
    answer = kwargs['instance']
    _mark_relevant_node_for_sync(answer)


def _mark_relevant_node_for_sync(answer):
    delete_records = _get_or_create_delete_records()
    if not Delivery.objects.filter(pk=answer.run.runnable_id).exists():
        delete_records.nodes_with_deleted_dependencies.append(answer.run.runnable_id)
        delete_records.save()


def _get_or_create_delete_records():
    delete_records = DeleteRecords.objects.first()
    if not delete_records:
        delete_records = DeleteRecords.objects.create(nodes_to_delete=[], nodes_with_deleted_dependencies=[])
    return delete_records
