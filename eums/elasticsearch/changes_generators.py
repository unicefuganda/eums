from django.conf import settings
import requests
from rest_framework.status import HTTP_200_OK
from eums.elasticsearch.mappings import DELIVERY_NODE_MAPPING
from eums.elasticsearch.sync_info import SyncInfo
from celery.utils.log import get_task_logger
from eums.models import DistributionPlanNode as DeliveryNode

logger = get_task_logger(__name__)


def generate_nodes_to_sync():
    last_sync = SyncInfo.last_successful_sync()
    if not last_sync:
        _setup_node_mapping()
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gte=last_sync_time)


def _setup_node_mapping():
    url = '%s/_mapping/delivery_node/' % settings.ELASTIC_SEARCH_URL
    try:
        response = requests.post(url, json=DELIVERY_NODE_MAPPING)
        if response.status_code != HTTP_200_OK:
            logger.error("Mapping Set-up Failed")
    except RuntimeError, error:
        logger.error("Mapping Set-up Failed: %s" % error.message)