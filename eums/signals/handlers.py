import datetime
from celery.utils.log import get_task_logger
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from eums.celery import app
from eums.models import DistributionPlanNode, DistributionPlan, Alert, SystemSettings, Flow, Programme
from eums.services.flow_scheduler import schedule_run_for
from eums.util.contact_client import ContactClient
from eums.vision.sync_runner import sync

logger = get_task_logger(__name__)


@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_node(sender, **kwargs):
    node = kwargs['instance']
    _resolve_alert_if_possible(node)
    if node.track and not node.is_root():
        schedule_run_for(node)

    if node.get_programme() and node.tree_position != Flow.Label.IMPLEMENTING_PARTNER:
        ContactClient.update_after_delivery_creation(node.contact_person_id,
                                                     node.tree_position,
                                                     node.get_programme().name,
                                                     node.location,
                                                     node.consignee.name)


@receiver(post_save, sender=DistributionPlan)
def on_post_save_delivery(sender, **kwargs):
    delivery = kwargs['instance']
    _resolve_alert_if_possible(delivery)
    if delivery.track and (not delivery.has_existing_run()):
        schedule_run_for(delivery)

    if kwargs['created']:
        ContactClient.update_after_delivery_creation(delivery.contact_person_id,
                                                     Flow.Label.IMPLEMENTING_PARTNER,
                                                     delivery.programme.name,
                                                     delivery.location,
                                                     delivery.consignee.name)


@receiver(pre_save, sender=SystemSettings)
def on_pre_save_system_settings(sender, **kwargs):
    system_settings = SystemSettings.objects.first()
    current_sync_date = system_settings.sync_start_date if system_settings else ''
    new_sync_date = kwargs['instance'].sync_start_date

    if new_sync_date \
            and new_sync_date < datetime.date.today() \
            and (not current_sync_date or new_sync_date < current_sync_date):
        start_date = new_sync_date.strftime('%d%m%Y')
        end_date = current_sync_date.strftime('%d%m%Y') if current_sync_date else ''
        run.apply_async(args=[start_date, end_date])


@app.task
def run(start_date, end_date):
    sync(start_date, end_date)


def _resolve_alert_if_possible(delivery):
    if delivery.is_retriggered and delivery.confirmed:
        try:
            Alert.objects.get(runnable__id=delivery.id).resolve_retriggered_delivery()
        except:
            pass
