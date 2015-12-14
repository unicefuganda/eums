import json

import datetime
from celery.utils.log import get_task_logger
import requests
from django.conf import settings

from eums.models import Flow
from eums.rapid_pro.fake_endpoints import runs
from eums.rapid_pro.flow_request_template import FlowRequestTemplate

HEADER = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}
ONE_HOUR = 3600

logger = get_task_logger(__name__)


class FlowLabelNonExistException(Exception):
    pass


class RapidProInMemoryCache(object):
    def __init__(self):
        self.cache_flow_mapping = {}
        self.flow_id_label_mapping = {}
        self.last_sync_time = None

    def flow_id(self, flow):
        if self.expired or flow.label not in self.cache_flow_mapping:
            self.sync()

        return self.cache_flow_mapping[flow.label]['flow']

    @property
    def expired(self):
        return self.last_sync_time is None or (datetime.datetime.now() - self.last_sync_time).seconds > ONE_HOUR

    def flow(self, flow_id):
        if self.expired: self.sync()

        if flow_id not in self.flow_id_label_mapping:
            raise FlowLabelNonExistException()

        return Flow.objects.filter(label__in=self.flow_id_label_mapping[flow_id]).first()

    def sync(self):
        response = requests.get(settings.RAPIDPRO_URLS['FLOWS'], headers=HEADER)
        if response.status_code == 200:
            self.invalidate()
            for rapid_flow in response.json()['results']:
                self.cache_flow_mapping.update({label: rapid_flow for label in rapid_flow["labels"] if
                                                len(rapid_flow["labels"]) > 0})
                self.flow_id_label_mapping.update({rapid_flow['flow']: rapid_flow['labels']})
            self.last_sync_time = datetime.datetime.now()

    def invalidate(self):
        self.cache_flow_mapping = {}
        self.flow_id_label_mapping = {}
        self.last_sync_time = None


class RapidProService(object):
    cache = RapidProInMemoryCache()
    headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}

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

        logger.info("payload %s" % json.dumps(payload))

        if settings.RAPIDPRO_LIVE:
            response = requests.post(settings.RAPIDPRO_URLS['RUNS'], data=json.dumps(payload),
                                     headers=self.headers)
            logger.info("Response from RapidPro: %s, %s" % (response.status_code, response.json()))
        else:
            runs.post(data=payload)

    def create_run(self, contact, flow, item, sender):
        payload = FlowRequestTemplate().build(phone=contact['phone'], flow=self.cache.flow_id(flow),
                                              sender=sender, item=item,
                                              contact_name="%s %s" % (contact['firstName'], contact['lastName']))

        logger.info("payload %s" % json.dumps(payload))

        if settings.RAPIDPRO_LIVE:
            response = requests.post(settings.RAPIDPRO_URLS['RUNS'], data=json.dumps(payload), headers=self.headers)
            logger.info("Response from RapidPro: %s, %s" % (response.status_code, response.json()))

    def flow(self, flow_id):
        self.cache.flow(flow_id)


rapid_pro_service = RapidProService()
