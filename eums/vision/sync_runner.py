import datetime
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
    if _get_start_date():
        sync_record = VisionSyncInfo.new_instance()
        _sync_consignee(sync_record)
        _sync_programme(sync_record)
        _sync_orders(sync_record)


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


def _sync_orders(sync_record):
    synchronizers = ({'SO': SalesOrderSynchronizer},
                     {'PO': PurchaseOrderSynchronizer},
                     {'RO': ReleaseOrderSynchronizer})

    for synchronizer_dict in synchronizers:
        key = synchronizer_dict.keys()[0]
        synchronizer = synchronizer_dict.values()[0]
        try:
            last_sync_date = _get_last_sync_date(key)
            if _is_last_sync_date_gte_today(last_sync_date):
                continue
            synchronizer(start_date=last_sync_date).sync()
            sync_record.set_sync_status_success(key)
            logger.info("%s sync successfully" % key)
        except VisionException, e:
            sync_record.set_sync_status_failure(key)
            logger.error("%s sync failed, Reason:%s" % (key, e.get_error_message()))


def _get_last_sync_date(key):
    last_so_sync = VisionSyncInfo.get_last_successful_sync('SO')

    if key == 'SO':
        return _convert_date_format(last_so_sync.sync_date) if last_so_sync else _get_start_date()

    last_sync = VisionSyncInfo.get_last_successful_sync(key)
    if not (last_sync and last_so_sync):
        return _get_start_date()

    last_so_sync_date = last_so_sync.sync_date
    last_sync_date = last_sync.sync_date
    return _convert_date_format(last_so_sync_date) if last_sync_date > last_so_sync_date \
        else _convert_date_format(last_sync_date)


def _convert_date_format(sync_date):
    return sync_date.strftime('%d%m%Y')


def _is_last_sync_date_gte_today(sync_date):
    return sync_date >= datetime.date.today().strftime('%d%m%Y')


def _get_start_date():
    start_date = SystemSettings.objects.all().first().sync_start_date
    return start_date.strftime('%d%m%Y') if start_date else ''
