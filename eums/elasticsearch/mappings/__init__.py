from django.conf import settings
import requests
from rest_framework.status import HTTP_200_OK
from celery.utils.log import get_task_logger

from eums.elasticsearch.mappings.node_mapping import DELIVERY_NODE_MAPPING

logger = get_task_logger(__name__)


def setup_mappings():
    url = '%s/delivery_node/' % settings.ELASTIC_SEARCH.MAPPING
    try:
        response = requests.post(url, json=DELIVERY_NODE_MAPPING)
        if response.status_code != HTTP_200_OK:
            logger.error("Mapping Set-up Failed")
    except RuntimeError, error:
        logger.error("Mapping Set-up Failed: %s" % error.message)


def mappings_exist():
    url = '%s/delivery_node/' % settings.ELASTIC_SEARCH.MAPPING
    try:
        response = requests.get(url)
        if response.status_code != HTTP_200_OK:
            logger.error("Mapping does not exist")
            return False
    except RuntimeError, error:
        logger.error("Mapping does not exist: %s" % error.message)
        return False
    return True
