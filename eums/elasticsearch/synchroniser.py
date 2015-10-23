from celery.schedules import crontab
from celery.task import periodic_task
from celery.utils.log import get_task_logger
from django.conf import settings
import requests
from rest_framework.status import HTTP_200_OK
from django.utils import timezone

from eums.elasticsearch.sync_data_generators import generate_nodes_to_sync
from eums.elasticsearch.serialisers import serialise_nodes, convert_to_bulk_api_format
from eums.elasticsearch.sync_info import SyncInfo

logger = get_task_logger(__name__)


@periodic_task(run_every=crontab(minute=0, hour=0))
def run():
    sync = SyncInfo.objects.create()
    nodes_to_sync = generate_nodes_to_sync()
    serialised_nodes = serialise_nodes(nodes_to_sync)
    _push_to_elasticsearch(serialised_nodes, sync)


def _push_to_elasticsearch(serialised_nodes, sync):
    try:
        formatted_data = convert_to_bulk_api_format(serialised_nodes)
        response = requests.post(settings.ELASTIC_SEARCH.BULK, data=formatted_data)
        if response.status_code == HTTP_200_OK:
            sync.status = SyncInfo.STATUS.SUCCESSFUL
        else:
            sync.status = SyncInfo.STATUS.FAILED
    except RuntimeError, error:
        sync.status = SyncInfo.STATUS.FAILED
        logger.error("Sync Failed: %s" % error.message)
    sync.end_time = timezone.now()
    sync.save()
