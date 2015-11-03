from celery.utils.log import get_task_logger

from django.db.models.signals import post_save
from django.dispatch import receiver

from eums.models import DistributionPlanNode, DistributionPlan, Alert
from eums.services.flow_scheduler import schedule_run_for

logger = get_task_logger(__name__)


@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_node(sender, **kwargs):
    node = kwargs['instance']
    _resolve_alert_if_possible(node)
    if node.track and not node.is_root():
        schedule_run_for(node)


@receiver(post_save, sender=DistributionPlan)
def on_post_save_delivery(sender, **kwargs):
    delivery = kwargs['instance']
    if kwargs.get('update_fields') and 'total_value' not in kwargs.get('update_fields'):
        _handle_signal(delivery)


def _handle_signal(delivery):
    _resolve_alert_if_possible(delivery)
    if delivery.track:
        schedule_run_for(delivery)


def _resolve_alert_if_possible(delivery):
    if delivery.is_retriggered and delivery.confirmed:
        try:
            Alert.objects.get(runnable__id=delivery.id).resolve_retriggered_delivery()
        except:
            pass
