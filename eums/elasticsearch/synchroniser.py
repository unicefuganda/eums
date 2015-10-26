from celery.schedules import crontab
from celery.task import periodic_task
from celery.utils.log import get_task_logger
from django.conf import settings
import requests
from rest_framework.status import HTTP_200_OK
from django.utils import timezone
from eums.elasticsearch.delete_records import DeleteRecords

from eums.elasticsearch.sync_data_generators import list_nodes_to_update, list_nodes_to_delete
from eums.elasticsearch.serialisers import serialise_nodes, convert_to_bulk_api_format
from eums.elasticsearch.sync_info import SyncInfo

logger = get_task_logger(__name__)


@periodic_task(run_every=crontab(minute=0, hour=0))
def run():
    sync = SyncInfo.objects.create()
    nodes_to_update = serialise_nodes(list_nodes_to_update())
    _push_to_elasticsearch(nodes_to_update, list_nodes_to_delete(), sync)


def _push_to_elasticsearch(nodes_to_update, nodes_to_delete, sync):
    try:
        formatted_data = convert_to_bulk_api_format(nodes_to_update, nodes_to_delete)
        response = requests.post(settings.ELASTIC_SEARCH.BULK, data=formatted_data)
        if response.status_code == HTTP_200_OK:
            sync.status = SyncInfo.STATUS.SUCCESSFUL
            _clear_delete_records(nodes_to_update, nodes_to_delete)
        else:
            sync.status = SyncInfo.STATUS.FAILED
    except RuntimeError, error:
        sync.status = SyncInfo.STATUS.FAILED
        logger.error("Sync Failed: %s" % error.message)
    sync.end_time = timezone.now()
    sync.save()


def _clear_delete_records(updated_nodes, deleted_nodes):
    delete_records = DeleteRecords.objects.first()
    if delete_records:
        for node in updated_nodes:
            nodes_with_deleted_dependencies = delete_records.nodes_with_deleted_dependencies or []
            if node in nodes_with_deleted_dependencies:
                nodes_with_deleted_dependencies.remove(node)
        for node in deleted_nodes:
            delete_records.nodes_to_delete.remove(node)
        delete_records.save()

