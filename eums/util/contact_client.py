import logging

import requests
from rest_framework.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_200_OK
from urllib3.connection import ConnectionError

from eums import settings

logger = logging.getLogger(__name__)


class ContactClient(object):
    @staticmethod
    def get(contact_person_id):
        default_contact = {'_id': '', 'firstName': '', 'lastName': '', 'phone': ''}
        try:
            response = requests.get(url='%s/%s' % (settings.CONTACTS_SERVICE_URL, contact_person_id))
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
            return HTTP_500_INTERNAL_SERVER_ERROR
