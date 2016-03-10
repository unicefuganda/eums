import json
import logging
from unittest import TestCase
from urllib import urlencode

import requests
from django.conf import settings
from django.test import override_settings
from mock import MagicMock
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT

from eums.rapid_pro.rapid_pro_service import HEADER
from eums.util.contact_client import ContactClient

logger = logging.getLogger(__name__)


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

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    def test_should_delete_rapid_pro_contact(self):
        phone = '+8618192235667'
        url_delete_rapid_pro_contact = '%s?%s' % (settings.RAPIDPRO_URLS.get('CONTACTS'), urlencode({
            'urns': 'tel:%s' % phone
        }))
        requests.delete = MagicMock(return_value=MagicMock(status_code=HTTP_204_NO_CONTENT))
        response = ContactClient.delete_rapid_pro_contact(phone)

        requests.delete.assert_called_once_with(url_delete_rapid_pro_contact, headers=HEADER,
                                                verify=settings.RAPIDPRO_SSL_VERIFY)
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    def test_should_get_rapid_pro_contact(self):
        first_name = "Jack"
        last_name = "Bob"
        phone = '+8618192235667'
        outcomes = ["YI105 - PCR 1 KEEP CHILDREN AND MOTHERS"]
        districts = ["Kampala"]
        ips = ["KAMPALA DHO, WAKISO DHO"]
        types = ["End-user, IP-consignee"]

        url_add_rapid_pro_contact = '%s?%s' % (settings.RAPIDPRO_URLS.get('CONTACTS'), urlencode({
            'urns': 'tel:%s' % phone
        }))

        contact = self.generate_eums_contact(districts, first_name, ips, last_name, outcomes, phone, types)

        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(contact))))

        response = ContactClient.get_rapid_pro_contact(phone)

        requests.get.assert_called_once_with(url_add_rapid_pro_contact, headers=HEADER,
                                             verify=settings.RAPIDPRO_SSL_VERIFY)

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.json().get('groups')), 1)
        self.assertEqual(response.json().get('groups')[0], 'EUMS')

        fields = response.json().get("fields")
        self.assertEqual(fields.get('firstname'), first_name)
        self.assertEqual(fields.get('lastname'), last_name)
        self.assertEqual(fields.get('outcomes'), ','.join(outcomes))
        self.assertEqual(fields.get('districts'), ','.join(districts))
        self.assertEqual(fields.get('ips'), ','.join(ips))
        self.assertEqual(fields.get('types'), ','.join(types))

    @override_settings(RAPIDPRO_LIVE=True,RAPIDPRO_SSL_VERIFY=False)
    def test_should_add_rapid_pro_contact(self):
        first_name = "Jack"
        last_name = "Bob"
        phone = '+8618192235667'
        outcomes = ["YI105 - PCR 1 KEEP CHILDREN AND MOTHERS"]
        districts = ["Kampala"]
        ips = ["KAMPALA DHO, WAKISO DHO"]
        types = ["End-user, IP-consignee"]

        contact = self.generate_eums_contact(districts, first_name, ips, last_name, outcomes, phone, types)
        requests.post = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(contact))))

        response = ContactClient.add_or_update_rapid_pro_contact(contact)

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.json().get('groups')), 1)
        self.assertEqual(response.json().get('groups')[0], 'EUMS')

        fields = response.json().get("fields")
        self.assertEqual(fields.get('firstname'), first_name)
        self.assertEqual(fields.get('lastname'), last_name)
        self.assertEqual(fields.get('outcomes'), ','.join(outcomes))
        self.assertEqual(fields.get('districts'), ','.join(districts))
        self.assertEqual(fields.get('ips'), ','.join(ips))
        self.assertEqual(fields.get('types'), ','.join(types))

        requests.post.assert_called_once_with(settings.RAPIDPRO_URLS.get('CONTACTS'),
                                              data=json.dumps(ContactClient.build_rapid_pro_contact(contact)),
                                              headers=HEADER,
                                              verify=settings.RAPIDPRO_SSL_VERIFY)

    def generate_eums_contact(self, districts, first_name, ips, last_name, outcomes, phone, types):
        contact = {
            '_id': 'contact_person_id',
            'firstName': first_name,
            'lastName': last_name,
            'phone': phone,
            'outcomes': outcomes,
            'types': types,
            'ips': ips,
            'districts': districts
        }
        return contact

    def generate_add_or_update_rapid_pro_contact_response(self, contact):
        return {
            "uuid": "e5de51c0-844b-4feb-8023-33b180bdf965",
            "name": "Jack Bob",
            "language": None,
            "group_uuids": ["fbc775f2-03e3-428e-93a2-608d7a7b46dc"],
            "urns": ["tel:%s" % contact.get('phone')],
            "fields": ContactClient.build_rapid_pro_contact_fields(contact),
            "blocked": False,
            "failed": False,
            "modified_on": "2016-03-07T09:09:46.429Z",
            "phone": contact.get('phone'),
            "groups": ['EUMS']
        }
