from celery.schedules import crontab
from celery.task import periodic_task
from celery.utils.log import get_task_logger
from django.conf import settings
import requests
from rest_framework.status import HTTP_200_OK
from eums.elasticsearch.mappings import DELIVERY_NODE_MAPPING
from eums.elasticsearch.serialisers import serialise_nodes, convert_to_bulk_api_format
from eums.elasticsearch.sync_info import SyncInfo
from eums.models import DistributionPlanNode as DeliveryNode
from django.utils import timezone

logger = get_task_logger(__name__)


@periodic_task(run_every=crontab(minute=0, hour=0))
def run():
    sync = SyncInfo.objects.create()
    nodes_to_sync = generate_nodes_to_sync()
    serialised_nodes = serialise_nodes(nodes_to_sync)
    _push_to_elasticsearch(serialised_nodes, sync)


def generate_nodes_to_sync():
    last_sync = SyncInfo.last_successful_sync()
    if not last_sync:
        _setup_node_mapping()
        return DeliveryNode.objects.all()
    last_sync_time = last_sync.start_time
    return DeliveryNode.objects.filter(created__gte=last_sync_time)


def _push_to_elasticsearch(serialised_nodes, sync):
    url = '%s/_bulk' % settings.ELASTIC_SEARCH_URL
    try:
        formatted_data = convert_to_bulk_api_format(serialised_nodes)
        response = requests.post(url, data=formatted_data)
        if response.status_code == HTTP_200_OK:
            sync.status = SyncInfo.STATUS.SUCCESSFUL
        else:
            sync.status = SyncInfo.STATUS.FAILED
    except RuntimeError, error:
        sync.status = SyncInfo.STATUS.FAILED
        logger.error("Sync Failed: %s" % error.message)
    sync.end_time = timezone.now()
    sync.save()


def _setup_node_mapping():
    url = '%s/_mapping/delivery_node/' % settings.ELASTIC_SEARCH_URL
    try:
        response = requests.post(url, json=DELIVERY_NODE_MAPPING)
        if response.status_code != HTTP_200_OK:
            logger.error("Mapping Set-up Failed")
    except RuntimeError, error:
        logger.error("Mapping Set-up Failed: %s" % error.message)
