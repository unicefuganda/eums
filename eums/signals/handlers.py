from celery.utils.log import get_task_logger

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from eums.models import DistributionPlanNode, DistributionPlan, Alert, SystemSettings
from eums.services.flow_scheduler import schedule_run_for
from eums.vision.sync_orders import sync_orders

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
    _resolve_alert_if_possible(delivery)
    if delivery.track and (not delivery.has_existing_run()):
        schedule_run_for(delivery)


@receiver(pre_save, sender=SystemSettings)
def on_pre_save_system_settings(sender, **kwargs):
    system_settings = SystemSettings.objects.first()
    current_sync_date = system_settings.sync_start_date if system_settings else ''
    new_sync_date = kwargs['instance'].sync_start_date

    if new_sync_date and (not current_sync_date or new_sync_date < current_sync_date):
        start_date = new_sync_date.strftime('%d%m%Y') if new_sync_date else ''
        end_date = current_sync_date.strftime('%d%m%Y') if current_sync_date else ''
        sync_orders.delay(start_date, end_date)


def _resolve_alert_if_possible(delivery):
    if delivery.is_retriggered and delivery.confirmed:
        try:
            Alert.objects.get(runnable__id=delivery.id).resolve_retriggered_delivery()
        except:
            pass
