import copy
import logging

import requests
from rest_framework.status import HTTP_200_OK, HTTP_504_GATEWAY_TIMEOUT
from urllib3.connection import ConnectionError

from eums import settings

logger = logging.getLogger(__name__)


def append_if_not_exist(val, value_list=[]):
    if val in value_list:
        return True

    value_list.append(val)
    return False


class ContactClient(object):
    @staticmethod
    def get(contact_person_id):
        default_contact = {'_id': '', 'firstName': '', 'lastName': '', 'phone': '', 'types': [], 'outcomes': [],
                           'ips': [],
                           'districts': []}
        try:
            response = requests.get(url='%s%s' % (settings.CONTACTS_SERVICE_URL, contact_person_id))
            if response.status_code is HTTP_200_OK:
                return response.json()

            logger.error('Contact not found')
            return default_contact
        except ConnectionError, error:
            logger.error(error)
            return default_contact

    @staticmethod
    def update(contact):
        try:
            response = requests.put(settings.CONTACTS_SERVICE_URL, contact)
            return response.status_code
        except ConnectionError, error:
            logger.error(error)
            return HTTP_504_GATEWAY_TIMEOUT

    @staticmethod
    def update_after_delivery_creation(contact_id, type, outcome, district, ip):
        try:
            contact = copy.deepcopy(ContactClient.get(contact_id))
            exist_type = append_if_not_exist(type, contact['types'])
            exist_outcome = append_if_not_exist(outcome, contact['outcomes'])
            exist_ip = append_if_not_exist(ip, contact['ips'])
            exist_district = append_if_not_exist(district, contact['districts'])

            if exist_district and exist_ip and exist_outcome and exist_type:
                return

            ContactClient.update(contact)

        except Exception, e:
            logger.error(e)
