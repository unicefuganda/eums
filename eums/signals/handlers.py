import datetime

from celery.utils.log import get_task_logger
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from eums.celery import app
from eums.models import DistributionPlanNode, DistributionPlan, Alert, SystemSettings, Flow, VisionSyncInfo
from eums.services.contact_service import ContactService
from eums.services.flow_scheduler import schedule_run_for
from eums.utils import format_date
from eums.vision.sync_runner import sync

logger = get_task_logger(__name__)


@receiver(post_save, sender=DistributionPlanNode)
def on_post_save_node(sender, **kwargs):
    node = kwargs['instance']
    _resolve_alert_if_possible(node)
    if node.track and not node.is_root():
        schedule_run_for(node)

    if settings.CELERY_LIVE and node.get_programme() and node.tree_position != Flow.Label.IMPLEMENTING_PARTNER:
        update_contact.apply_async(args=[node])


@receiver(post_save, sender=DistributionPlan)
def on_post_save_delivery(sender, **kwargs):
    delivery = kwargs['instance']
    _resolve_alert_if_possible(delivery)
    if delivery.track and (not delivery.has_existing_run()):
        schedule_run_for(delivery)

    if settings.CELERY_LIVE and (delivery.track or delivery.is_auto_track_confirmed):
        update_contact.apply_async(args=[delivery])


@receiver(pre_save, sender=SystemSettings)
def on_pre_save_system_settings(sender, **kwargs):
    start_date = VisionSyncInfo.get_manual_sync_start_date()
    end_date = VisionSyncInfo.get_manual_sync_end_date()
    new_sync_date = kwargs['instance'].sync_start_date

    if new_sync_date and new_sync_date < datetime.date.today() and (not start_date or new_sync_date < start_date):
        logger.info('manual sync. start_date=%s, end_date=%s' % (new_sync_date, end_date))
        sync_record = VisionSyncInfo.new_instance(False, new_sync_date, end_date)
        run.apply_async(args=[sync_record, format_date(new_sync_date), format_date(end_date)])


@app.task
def run(sync_record, start_date, end_date):
    sync(sync_record, start_date, end_date)


@app.task
def update_contact(runnable):
    tree_position = getattr(runnable, 'tree_position', Flow.Label.IMPLEMENTING_PARTNER)
    ContactService.update_after_delivery_creation(runnable.contact_person_id,
                                                  tree_position,
                                                  runnable.programme.name,
                                                  runnable.location,
                                                  runnable.consignee.name)


def _resolve_alert_if_possible(delivery):
    if delivery.is_retriggered and delivery.confirmed:
        try:
            Alert.objects.get(runnable__id=delivery.id).resolve_retriggered_delivery()
        except:
            pass
