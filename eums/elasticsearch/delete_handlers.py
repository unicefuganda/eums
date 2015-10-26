from django.db.models.signals import post_delete
from django.dispatch import receiver
from eums.elasticsearch.delete_records import DeleteRecords
from eums.models import DistributionPlanNode as DeliveryNode, Run
from eums.models import DistributionPlan as Delivery


@receiver(post_delete, sender=DeliveryNode)
def on_delete_node(sender, **kwargs):
    node = kwargs['instance']
    delete_records = DeleteRecords.objects.first()
    if not delete_records:
        delete_records = DeleteRecords.objects.create(nodes_to_delete=[])

    delete_records.nodes_to_delete.append(node.id)
    delete_records.save()


@receiver(post_delete, sender=Run)
def on_delete_run(sender, **kwargs):
    run = kwargs['instance']
    delete_records = DeleteRecords.objects.first()
    if not delete_records:
        delete_records = DeleteRecords.objects.create(nodes_to_delete=[], nodes_with_deleted_dependencies=[])

    if not Delivery.objects.filter(pk=run.runnable_id).exists():
        delete_records.nodes_with_deleted_dependencies.append(run.runnable_id)
        delete_records.save()
