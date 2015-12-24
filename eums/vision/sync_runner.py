from celery.schedules import crontab
from celery.task import periodic_task
from celery.utils.log import get_task_logger

from eums.models import VisionSyncInfo, SystemSettings
from eums.vision.consignee_synchronizer import ConsigneeSynchronizer
from eums.vision.programme_synchronizer import ProgrammeSynchronizer
from eums.vision.purchase_order_synchronizer import PurchaseOrderSynchronizer
from eums.vision.release_order_synchronizer import ReleaseOrderSynchronizer
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionException

logger = get_task_logger(__name__)


@periodic_task(run_every=crontab(minute=0, hour=1))
def run():
    if SystemSettings.get_sync_start_date():
        sync()


def sync(start_date='', end_date=''):
    sync_record = VisionSyncInfo.new_instance()
    _sync_consignee(sync_record)
    _sync_programme(sync_record)
    _sync_orders(sync_record, start_date, end_date)


def _sync_orders(sync_record, start_date='', end_date=''):
    order_synchronizers = ({'SO': SalesOrderSynchronizer},
                           {'PO': PurchaseOrderSynchronizer},
                           {'RO': ReleaseOrderSynchronizer})

    for synchronizer_dict in order_synchronizers:
        key = synchronizer_dict.keys()[0]
        synchronizer = synchronizer_dict.values()[0]
        try:
            if not start_date:
                start_date = VisionSyncInfo.get_sync_start_date(key)
            synchronizer(start_date, end_date).sync()
            sync_record.set_sync_status_success(key)
            logger.info("%s sync successfully" % key)
        except VisionSyncInfo, e:
            sync_record.set_sync_status_failure(key)
            logger.error("%s sync failed, Reason:%s" % (key, e.get_error_message()))


def _sync_consignee(sync_record):
    try:
        ConsigneeSynchronizer().sync()
        sync_record.set_sync_status_success('CONSIGNEE')
        logger.info("Consignee sync successfully")
    except VisionException, e:
        sync_record.set_sync_status_failure('CONSIGNEE')
        logger.error("Consignee sync failed, Reason:%s" % e.get_error_message())


def _sync_programme(sync_record):
    try:
        ProgrammeSynchronizer().sync()
        sync_record.set_sync_status_success('PROGRAMME')
        logger.info("Programme sync successfully")
    except VisionException, e:
        sync_record.set_sync_status_failure('PROGRAMME')
        logger.error("Programme sync failed, Reason:%s" % e.get_error_message())
