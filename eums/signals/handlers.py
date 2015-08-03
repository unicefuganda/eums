from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.flow_scheduler import schedule_run_for


@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_node(sender, **kwargs):
    node = kwargs['instance']
    if node.track and not node.is_root() and node.latest_run() is None:
        schedule_run_for(node)

@receiver(post_save, sender=DistributionPlan)
def on_post_save_delivery(sender, **kwargs):
    delivery = kwargs['instance']
    if delivery.track and delivery.latest_run() is None:
        schedule_run_for(delivery)
