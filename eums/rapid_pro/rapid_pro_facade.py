import json
from celery.utils.log import get_task_logger
import requests
from django.conf import settings
from eums.rapid_pro.fake_endpoints import runs

logger = get_task_logger(__name__)


def start_delivery_run(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    sender = kwargs['sender']
    flow = kwargs['flow']
    payload = {
        "flow": flow,
        "phone": [consignee['phone']],
        "extra": {
            settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: "%s %s" % (consignee['firstName'], consignee['lastName']),
            settings.RAPIDPRO_EXTRAS['SENDER']: sender,
            settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}
    logger.info("payload %s" % json.dumps(payload))

    if settings.RAPIDPRO_LIVE:
        response = requests.post(settings.RAPIDPRO_URLS['RUNS'], data=json.dumps(payload), headers=headers)
        logger.info("Response from RapidPro: %s, %s" % (response.status_code, response.json()))
    else:
        runs.post(data=payload)