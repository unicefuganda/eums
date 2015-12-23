import logging

from eums.models import ReleaseOrder, DistributionPlan, DistributionPlanNode, Runnable

logger = logging.getLogger(__name__)


class ReleaseOrderToDeliveryService(object):
    @classmethod
    def is_release_order_not_sync(cls, release_order):
        return release_order.delivery() is None

    @classmethod
    def sync_release_order_to_delivery(cls, release_order=None):
        logger.info('sync_release_order_to_delivery->' + str(release_order))
        delivery = DistributionPlan.objects.create(delivery_date=release_order.delivery_date,
                                                   consignee=release_order.consignee,
                                                   programme=release_order.sales_order.programme)

        for item in release_order.items.all():
            DistributionPlanNode.objects.create(distribution_plan=delivery, delivery_date=release_order.delivery_date,
                                                consignee=release_order.consignee,
                                                programme=release_order.sales_order.programme, item=item,
                                                tree_position=Runnable.IMPLEMENTING_PARTNER, quantity=item.quantity)


# @periodic_task(run_every=crontab())
def execute_sync_release_order_to_delivery():
    logger.info('execute_sync_release_order_to_delivery')

    for release_order in ReleaseOrder.objects.all():
        if ReleaseOrderToDeliveryService.is_release_order_not_sync(release_order):
            ReleaseOrderToDeliveryService.sync_release_order_to_delivery(release_order)
