from celery.utils.log import get_task_logger
from django.conf import settings
import requests

from eums.elasticsearch.mappings import setup_mappings
from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode, Consignee

logger = get_task_logger(__name__)


def generate_nodes_to_sync():
    last_sync = SyncInfo.last_successful_sync()
    nodes_to_update = _find_nodes_to_update(last_sync)
    new_nodes = _find_new_nodes(last_sync)
    return list(nodes_to_update) + list(new_nodes)


def _find_new_nodes(last_sync):
    if not last_sync:
        setup_mappings()
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gte=last_sync_time)


def _find_nodes_to_update(last_sync):
    if last_sync:
        changed_consignee_ids = Consignee.objects.filter(modified__gte=last_sync.start_time).values_list('id', flat=True)
        query = {
            "fields": [],
            "filter": {
                "terms": {
                    "consignee.id": changed_consignee_ids
                }
            }
        }
        url = '%s/delivery_node/_search' % settings.ELASTIC_SEARCH_URL
        response = requests.post(url, json=query)
        node_ids = [hit['_id'] for hit in response.json()['hits']['hits']]
        return DeliveryNode.objects.filter(pk__in=node_ids)
    return []
