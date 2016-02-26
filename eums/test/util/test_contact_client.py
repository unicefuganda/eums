from unittest import TestCase

import requests
from mock import MagicMock

from eums.util.contact_client import ContactClient


class ContactClientTest(TestCase):
    def test_should_get_contact(self):
        contact = {
            '_id': 'contact_person_id',
            'firstName': 'chris',
            'lastName': 'george',
            'phone': '+256781111111',
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

    def test_should_not_update_contact_when_contact_not_modified(self):
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
        ContactClient.get = MagicMock(return_value=contact)
        ContactClient.update = MagicMock(return_value=200)

        ContactClient.update_after_delivery_creation(contact['_id'], type='End-user',
                                                     outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                     ip='WAKISO DHA', district='Wakiso')
        ContactClient.get.assert_called_once_with(contact['_id'])
        ContactClient.update.assert_not_called(contact)

    def test_should_update_contact_when_contact_types_modified(self):
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
        ContactClient.get = MagicMock(return_value=contact)
        ContactClient.update = MagicMock(return_value=200)

        ContactClient.update_after_delivery_creation(contact['_id'], type='Sub-consignee',
                                                     outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                     ip='WAKISO DHO', district='Wakiso')
        contact.update({'types': ['End-user', 'Sub-consignee']})

        ContactClient.get.assert_called_once_with(contact['_id'])
        ContactClient.update.assert_called_once_with(contact)

    def test_should_update_contact_when_contact_districts_modified(self):
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
        ContactClient.get = MagicMock(return_value=contact)
        ContactClient.update = MagicMock(return_value=200)

        ContactClient.update_after_delivery_creation(contact['_id'], type='End-user',
                                                     outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                     ip='WAKISO DHO', district='Abum')

        contact.update({'districts': ['Wakiso', 'Abum']})

        ContactClient.get.assert_called_once_with(contact['_id'])
        ContactClient.update.assert_called_once_with(contact)

    def test_should_update_contact_when_contact_ips_modified(self):
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
        ContactClient.get = MagicMock(return_value=contact)
        ContactClient.update = MagicMock(return_value=200)

        ContactClient.update_after_delivery_creation(contact['_id'], type='End-user',
                                                     outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                     ip='ABUM DHO', district='Wakiso')

        contact.update({'ips': ['WAKISO DHO', 'ABUM DHO']})

        ContactClient.get.assert_called_once_with(contact['_id'])
        ContactClient.update.assert_called_once_with(contact)

    def test_should_update_contact_when_contact_outcomes_modified(self):
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
        ContactClient.get = MagicMock(return_value=contact)
        ContactClient.update = MagicMock(return_value=200)

        ContactClient.update_after_delivery_creation(contact['_id'], type='End-user',
                                                     outcome='YI101 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                     ip='WAKISO DHO', district='Wakiso')

        contact.update(
                {'outcomes': ['YI105 - PCR 1 KEEP CHILDREN AND MOTHERS', 'YI101 - PCR 1 KEEP CHILDREN AND MOTHERS']})

        ContactClient.get.assert_called_once_with(contact['_id'])
        ContactClient.update.assert_called_once_with(contact)
