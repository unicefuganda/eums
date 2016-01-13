import logging

import requests
from urllib3.connection import ConnectionError

logger = logging.getLogger(__name__)


class RemoteContactUtils(object):
    @staticmethod
    def load_remote_contact_in_json(contact_person_id):
        default_contact = {'_id': '', 'firstName': '', 'lastName': '', 'phone': ''}
        try:
            response = requests.get(url='http://localhost:8005/api/contacts/%s' % contact_person_id)
            if response.status_code is 200:
                return response.json()

            logger.error('Contact not found')
            return default_contact
        except ConnectionError, error:
            logger.error(error)
            return default_contact
