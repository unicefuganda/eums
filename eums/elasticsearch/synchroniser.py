from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode


def run():
    SyncInfo.objects.create()


def generate_nodes_to_sync():
    last_sync_time = SyncInfo.last_successful_sync().start_time
    return DeliveryNode.objects.filter(created__gt=last_sync_time)
