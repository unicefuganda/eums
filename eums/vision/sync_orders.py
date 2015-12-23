from celery.utils.log import get_task_logger

from eums.celery import app
from eums.models import VisionSyncInfo
from eums.vision.purchase_order_synchronizer import PurchaseOrderSynchronizer
from eums.vision.release_order_synchronizer import ReleaseOrderSynchronizer
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer
from eums.vision.vision_data_synchronizer import VisionException

logger = get_task_logger(__name__)


@app.task
def sync_orders(start_date, end_date):
    logger.info("Sync started by admin.")
    order_synchronizers = ({'SO': SalesOrderSynchronizer},
                           {'PO': PurchaseOrderSynchronizer},
                           {'RO': ReleaseOrderSynchronizer})

    if not start_date:
        return

    sync_record = VisionSyncInfo.new_instance()

    for synchronizer_dict in order_synchronizers:
        key = synchronizer_dict.keys()[0]
        synchronizer = synchronizer_dict.values()[0]
        try:
            synchronizer(start_date=start_date, end_date=end_date).sync()
            sync_record.set_sync_status_success(key)
            logger.info("%s sync successfully" % key)
        except VisionException, e:
            sync_record.set_sync_status_failure(key)
            logger.error("%s sync failed, Reason:%s" % (key, e.get_error_message()))
