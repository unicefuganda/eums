from unittest import TestCase

import requests
from mock import MagicMock

from eums.util.contact_client import ContactClient


class RemoteContactUtilsTest(TestCase):
    def test_should_get_contact(self):
        contact = {
            '_id': 'contact_person_id',
            'firstName': 'chris',
            'lastName': 'george',
            'phone': '+256781111111'
        }
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=contact)))
        response = ContactClient.get(contact['_id'])

        self.assertEqual(response, contact)

    def test_should_update_contact(self):
        contact = {
            '_id': 'contact_person_id',
            'firstName': 'chris',
            'lastName': 'george',
            'phone': '+256781111111',
            'outcomes': ['YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'],
            'types': ['End-user'],
            'ips': ['WAKISO DHO'],
            'districts': ['Wakiso']
        }
        requests.put = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=contact)))
        response = ContactClient.update(contact)

        self.assertEqual(response, 200)
