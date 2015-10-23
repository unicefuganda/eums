from celery.utils.log import get_task_logger

from eums.elasticsearch.mappings import setup_mappings
from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode

logger = get_task_logger(__name__)


def generate_nodes_to_sync():
    last_sync = SyncInfo.last_successful_sync()
    if not last_sync:
        setup_mappings()
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gte=last_sync_time)


