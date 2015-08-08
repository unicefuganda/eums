from celery.utils.log import get_task_logger

from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.flow_scheduler import schedule_run_for

logger = get_task_logger(__name__)

@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_node(sender, **kwargs):
    node = kwargs['instance']
    if node.track and not node.is_root():
        logger.info("POST SAVE NODE: %s" % node.__dict__)
        schedule_run_for(node)


@receiver(post_save, sender=DistributionPlan)
def on_post_save_delivery(sender, **kwargs):
    delivery = kwargs['instance']
    if delivery.track:
        logger.info("POST SAVE DELIVERY: %s" % delivery.__dict__)
        schedule_run_for(delivery)
