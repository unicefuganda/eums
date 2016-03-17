from celery.schedules import crontab
from celery.task import periodic_task
from celery.utils.log import get_task_logger

from eums.celery import app
from eums.models import VisionSyncInfo, SystemSettings
from eums.services.release_order_to_delivery_service import execute_sync_release_order_to_delivery
from eums.utils import format_date
from eums.vision.consignee_synchronizer import ConsigneeSynchronizer
from eums.vision.programme_synchronizer import ProgrammeSynchronizer
from eums.vision.purchase_order_synchronizer import PurchaseOrderSynchronizer
from eums.vision.release_order_synchronizer import ReleaseOrderSynchronizer
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionException

logger = get_task_logger(__name__)


@periodic_task(run_every=crontab(minute=0, hour=1))
def run():
    if not resync_if_manual_sync_fail():
        daily_sync()


def resync_if_manual_sync_fail():
    start_date = VisionSyncInfo.get_manual_sync_start_date()
    end_date = VisionSyncInfo.get_manual_sync_end_date()
    if start_date and VisionSyncInfo.get_last_manual_sync_status() == VisionSyncInfo.STATUS.FAILURE:
        logger.info('resync as manual sync failed. start_date=%s, end_date=%s' % (start_date, end_date))
        sync_record = VisionSyncInfo.new_instance(False, start_date, end_date)
        sync(sync_record, format_date(start_date), format_date(end_date))
        return True
    return False


def daily_sync():
    start_date = VisionSyncInfo.get_daily_sync_start_date()
    end_date = VisionSyncInfo.get_daily_sync_end_date()
    if start_date:
        logger.info('daily sync. start_date=%s, end_date=%s' % (start_date, end_date))
        sync_record = VisionSyncInfo.new_instance(True, start_date, end_date)
        sync(sync_record, format_date(start_date), format_date(end_date))


def sync(sync_record, start_date, end_date):
    _sync_consignee(sync_record)
    _sync_programme(sync_record)
    _sync_orders(sync_record, start_date, end_date)
    _auto_track_release_orders.apply_async()


def _sync_orders(sync_record, start_date='', end_date=''):
    order_synchronizers = ({'SO': SalesOrderSynchronizer},
                           {'PO': PurchaseOrderSynchronizer},
                           {'RO': ReleaseOrderSynchronizer})

    for synchronizer_dict in order_synchronizers:
        key = synchronizer_dict.keys()[0]
        synchronizer = synchronizer_dict.values()[0]
        try:
            synchronizer(start_date, end_date).sync()
            sync_record.set_sync_status_success()
            logger.info("%s sync successfully" % key)
        except VisionException, e:
            sync_record.set_sync_status_failure()
            logger.error("%s sync failed, Reason:%s" % (key, e.message))


def _sync_consignee(sync_record):
    try:
        ConsigneeSynchronizer().sync()
        sync_record.set_sync_status_success()
        logger.info("Consignee sync successfully")
    except VisionException, e:
        sync_record.set_sync_status_failure()
        logger.error("Consignee sync failed, Reason:%s" % e.message)


def _sync_programme(sync_record):
    try:
        ProgrammeSynchronizer().sync()
        sync_record.set_sync_status_success()
        logger.info("Programme sync successfully")
    except VisionException, e:
        sync_record.set_sync_status_failure()
        logger.error("Programme sync failed, Reason:%s" % e.message)


@app.task
def _auto_track_release_orders():
    execute_sync_release_order_to_delivery()
