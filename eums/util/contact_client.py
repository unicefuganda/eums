import copy
import logging

import requests
from rest_framework.status import HTTP_200_OK, HTTP_504_GATEWAY_TIMEOUT
from urllib3.connection import ConnectionError

from eums import settings

logger = logging.getLogger(__name__)


class ContactClient(object):
    @staticmethod
    def get(contact_person_id):
        default_contact = {'_id': '', 'firstName': '', 'lastName': '', 'phone': '',
                           'types': [], 'outcomes': [], 'ips': [], 'districts': []}
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
            origin_contact = ContactClient.get(contact_id)
            updated_contact = ContactClient._update_contact(origin_contact, type, outcome, district, ip)

            if origin_contact != updated_contact:
                ContactClient.update(updated_contact)
        except Exception, e:
            logger.error(e)

    @staticmethod
    def _append_if_not_exist(val, value_list=[]):
        if val and (val not in value_list):
            value_list.append(val)

    @staticmethod
    def _update_contact(origin_contact, type, outcome, district, ip):
        updated_contact = copy.deepcopy(origin_contact)
        ContactClient._append_if_not_exist(type, updated_contact['types'])
        ContactClient._append_if_not_exist(outcome, updated_contact['outcomes'])
        ContactClient._append_if_not_exist(ip, updated_contact['ips'])
        ContactClient._append_if_not_exist(district, updated_contact['districts'])

        return updated_contact
