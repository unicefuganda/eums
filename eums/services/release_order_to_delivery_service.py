import logging

from celery.schedules import crontab
from celery.task import periodic_task

from eums.models import ReleaseOrder, DistributionPlan, DistributionPlanNode

logger = logging.getLogger(__name__)


class ReleaseOrderToDeliveryService(object):
    @classmethod
    def is_release_order_not_sync(cls, release_order):
        return release_order.delivery() is None

    @classmethod
    def sync_release_order_to_delivery(cls, release_order=None):
        delivery = DistributionPlan(delivery_date=release_order.delivery_date, consignee=release_order.consignee,
                                    programme=release_order.sales_order.programme).save()
        DistributionPlanNode(distribution_plan=delivery, delivery_date=release_order.delivery_date,
                             consignee=release_order.consignee, programme=release_order.sales_order.programme,
                             item=release_order.items.first()).save()


@periodic_task(run_every=crontab())
def execute_sync_release_order_to_delivery():
    logger.info('execute_sync_release_order_to_delivery')
    for release_order in ReleaseOrder.objects.all():
        if ReleaseOrderToDeliveryService.is_release_order_not_sync(release_order):
            ReleaseOrderToDeliveryService.sync_release_order_to_delivery(release_order)
