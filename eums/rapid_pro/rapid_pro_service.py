import json

import datetime
from celery.utils.log import get_task_logger
import requests
from django.conf import settings
from eums.rapid_pro.fake_endpoints import runs

ONE_HOUR = 3600

logger = get_task_logger(__name__)


class InMemoryCache(object):
    def __init__(self):
        super(InMemoryCache, self).__init__()
        self.cache_flow_mapping = {}
        self.last_sync_time = None

    def flow_id(self, flow):
        if self.expired or flow.label not in self.cache_flow_mapping:
            self.sync()

        return self.cache_flow_mapping[flow.label]['flow']

    def sync(self):
        headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}
        response = requests.get(settings.RAPIDPRO_URLS['FLOWS'], headers=headers)
        if response.status_code == 200:
            for rapid_flow in response.json()['results']:
                self.cache_flow_mapping.update({label: rapid_flow for label in rapid_flow["labels"] if
                                                len(rapid_flow["labels"]) > 0})
            self.last_sync_time = datetime.datetime.now()

    @property
    def expired(self):
        return self.last_sync_time is None or (datetime.datetime.now() - self.last_sync_time).seconds > ONE_HOUR


class RapidProService(object):
    cache = InMemoryCache()

    def start_delivery_run(self, **kwargs):
        contact_person = kwargs['contact_person']
        item_description = kwargs['item_description']
        payload = {
            "flow": (kwargs['flow']),
            "phone": [contact_person['phone']],
            "extra": {
                settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: "%s %s" % (
                    contact_person['firstName'], contact_person['lastName']),
                settings.RAPIDPRO_EXTRAS['SENDER']: (kwargs['sender']),
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

    def create_run(self, flow, contact, sender, item, **data):
        payload = {
            "flow": self.cache.flow_id(flow),
            "phone": [contact['phone']],
            "extra": {
                'contactName': "%s %s" % (contact['firstName'], contact['lastName']),
                'sender': sender,
                'product': item
            }
        }
        headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}
        logger.info("payload %s" % json.dumps(payload))

        if settings.RAPIDPRO_LIVE:
            response = requests.post(settings.RAPIDPRO_URLS['RUNS'], data=json.dumps(payload), headers=headers)
            logger.info("Response from RapidPro: %s, %s" % (response.status_code, response.json()))


rapid_pro_service = RapidProService()
