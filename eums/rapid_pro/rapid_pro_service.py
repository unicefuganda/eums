import json
import requests
from celery.utils.log import get_task_logger
from django.conf import settings
from eums.models import Flow
from eums.rapid_pro.exception.rapid_pro_exception import FlowLabelNonExistException
from eums.rapid_pro.flow_request_template import FlowRequestTemplate
from eums.rapid_pro.in_memory_cache import InMemoryCache

HEADER = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, "Content-Type": "application/json"}

logger = get_task_logger(__name__)


class RapidProService(object):
    rapid_pro_label_map = {
        'IMPLEMENTING_PARTNER': 'IMPLEMENTING_PARTNER',
        'MIDDLE_MAN': 'SUB_CONSIGNEES',
        'END_USER': 'END_USER'
    }

    @staticmethod
    def rapid_pro_label(flow_label):
        if flow_label in RapidProService.rapid_pro_label_map:
            return RapidProService.rapid_pro_label_map[flow_label]
        else:
            return None

    @staticmethod
    def internal_flow_label(label):
        flow_label_result = []
        for flow_label, rapid_pro_label in RapidProService.rapid_pro_label_map.items():
            if label[0] == rapid_pro_label:
                flow_label_result.append(flow_label)
                return flow_label_result

    def __init__(self):
        super(RapidProService, self).__init__()
        self.cache = InMemoryCache()

    def create_run(self, contact, flow, item, sender):
        payload = FlowRequestTemplate().build(phone=contact['phone'], flow=self.flow_id(flow),
                                              sender=sender, item=item,
                                              contact_name="%s %s" % (contact['firstName'], contact['lastName']))

        logger.info("payload %s" % json.dumps(payload))

        logger.info("url: %s" % settings.RAPIDPRO_URLS['RUNS'])
        logger.info("header: %s" % HEADER)

        if settings.RAPIDPRO_LIVE:
            response = requests.post(settings.RAPIDPRO_URLS['RUNS'], data=json.dumps(payload), headers=HEADER)
            logger.info("Response from RapidPro: %s, %s" % (response.status_code, response.json()))

    def flow(self, flow_id):
        logger.info("flow_id: %s" % flow_id)

        self.__sync_if_required()

        flow_id = int(flow_id)
        if flow_id not in self.cache.flow_label_mapping:
            raise FlowLabelNonExistException()

        rapid_pro_flow_label = self.cache.flow_label_mapping[flow_id]
        print "rapid_pro_flow_label=%s" % rapid_pro_flow_label

        flow_label = RapidProService.internal_flow_label(rapid_pro_flow_label)

        print "label=%s" % flow_label

        return Flow.objects.filter(label__in=flow_label).first()

    def flow_id(self, flow):
        logger.info("flow_id: %s" % flow)
        logger.info("url: %s" % settings.RAPIDPRO_URLS['RUNS'])
        logger.info("header: %s" % HEADER)

        self.__sync_if_required()
        rapid_pro_flow_label = RapidProService.rapid_pro_label(flow.label)
        if rapid_pro_flow_label is not None:
            for flow_id, labels in self.cache.flow_label_mapping.iteritems():
                if rapid_pro_flow_label in labels:
                    return flow_id

        raise FlowLabelNonExistException()

    def __sync_if_required(self):
        if self.cache.expired:
            logger.info("Rapid Pro cache has been expired, start to sync.")
            self.__sync()

    def __sync(self):
        response = requests.get(settings.RAPIDPRO_URLS['FLOWS'], headers=HEADER)
        print "~~~~~response: %s" % response
        if response.status_code == 200:
            self.cache.invalidate()
            flows = response.json()['results']
            print "flows::::%s" % flows
            self.cache.update(
                flow_label_mapping={rapid['flow']: rapid['labels'] for rapid in flows if len(rapid['labels']) > 0})
        else:
            logger.warning("Failed to get flows information from Rapidpro, response=%s" % response)


rapid_pro_service = RapidProService()
