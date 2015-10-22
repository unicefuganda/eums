from eums.elasticsearch.serialisers import serialise_nodes
from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode


def run():
    SyncInfo.objects.create()
    nodes_to_sync = generate_nodes_to_sync()
    serialise_nodes(nodes_to_sync)


def generate_nodes_to_sync():
    last_sync = SyncInfo.last_successful_sync()
    if not last_sync:
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gt=last_sync_time)
