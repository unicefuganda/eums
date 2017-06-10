import copy
import json
import logging
from unittest import TestCase
from urllib import urlencode

import requests
from django.conf import settings
from django.test import override_settings
from mock import MagicMock, patch
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT

from eums.rapid_pro.rapid_pro_service import HEADER
from eums.services.contact_service import ContactService, HEADER_CONTACT

logger = logging.getLogger(__name__)

CONTACT = {
    '_id': 'contact_person_id',
    'firstName': 'chris',
    'lastName': 'george',
    'phone': '+256781111111',
    'outcomes': ['YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'],
    'types': ['End-user'],
    'ips': ['WAKISO DHO'],
    'districts': ['Wakiso']
}


class ContactServiceTest(TestCase):
    def test_should_convert_type_label(self):
        pre_types = ['IMPLEMENTING_PARTNER', 'MIDDLE_MAN', 'END_USER']
        self.assertEquals(['IP', 'Sub-consignee', 'End-user'], ContactService.convert_contact_types(pre_types))

    def test_should_partly_convert_type_label(self):
        pre_types = ['IMPLEMENTING_PARTNER', 'MIDDLE', 'END_USER']
        self.assertEquals(['IP', 'End-user'], ContactService.convert_contact_types(pre_types))

    def test_should_not_convert_type_label_when_empty(self):
        self.assertIsNone(ContactService.convert_contact_types([]))

    def test_should_not_convert_type_label_when_none(self):
        self.assertIsNone(ContactService.convert_contact_types(None))

    def test_should_get_contact(self):
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))
        response = ContactService.get(CONTACT['_id'])

        self.assertEqual(response, CONTACT)

    def test_should_search_contact_by_name(self):
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))
        response = ContactService.get(CONTACT['firstName'])

        self.assertEqual(response, CONTACT)

    def test_should_get_contact_by_user_id(self):
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))
        response = ContactService.get_by_user_id('17')

        self.assertEqual(response, CONTACT)

    def test_should_search_contact_by_phone(self):
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))
        response = ContactService.get(CONTACT['phone'])

        self.assertEqual(response, CONTACT)

    @override_settings(CELERY_LIVE=True)
    def test_should_update_contact(self):
        requests.put = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))
        response = ContactService.update(CONTACT)

        requests.put.assert_called_once_with('%s' % settings.CONTACTS_SERVICE_URL, json.dumps(CONTACT),
                                             headers=HEADER_CONTACT)

        self.assertEqual(response, 200)

    def test_should_delete_contact(self):
        requests.delete = MagicMock(return_value=MagicMock(status_code=204))
        response = ContactService.delete(CONTACT.get('_id'))

        requests.delete.assert_called_once_with(url='%s%s' % (settings.CONTACTS_SERVICE_URL, CONTACT['_id']))

        self.assertEqual(response, 204)

    def test_should_add_contact(self):
        requests.post = MagicMock(return_value=MagicMock(status_code=201, json=MagicMock(return_value=CONTACT)))
        response = ContactService.add(CONTACT)

        requests.post.assert_called_once_with('%s' % settings.CONTACTS_SERVICE_URL, json.dumps(CONTACT),
                                              headers=HEADER_CONTACT)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), CONTACT)

    @patch('eums.services.contact_service.ContactService.get')
    @patch('eums.services.contact_service.ContactService.update')
    def test_should_not_update_contact_when_contact_not_modified(self, update, get):
        get.return_value = CONTACT
        update.return_value = 200

        ContactService.update_after_delivery_creation(CONTACT['_id'], type='End-user',
                                                      outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                      ip='WAKISO DHA', district='Wakiso')
        ContactService.get.assert_called_once_with(CONTACT['_id'])
        ContactService.update.assert_not_called(CONTACT)

    @patch('eums.services.contact_service.ContactService.get')
    @patch('eums.services.contact_service.ContactService.update')
    def test_should_update_contact_when_contact_types_modified(self, update, get):
        get.return_value = CONTACT
        update.return_value = 200

        ContactService.update_after_delivery_creation(CONTACT['_id'], type='Sub-consignee',
                                                      outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                      ip='WAKISO DHO', district='Wakiso')
        CONTACT.update({'types': ['End-user', 'Sub-consignee']})

        ContactService.get.assert_called_once_with(CONTACT['_id'])
        ContactService.update.assert_called_once_with(CONTACT)

    @patch('eums.services.contact_service.ContactService.get')
    @patch('eums.services.contact_service.ContactService.update')
    def test_should_update_contact_when_contact_districts_modified(self, update, get):
        get.return_value = CONTACT
        update.return_value = 200

        ContactService.update_after_delivery_creation(CONTACT['_id'], type='End-user',
                                                      outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                      ip='WAKISO DHO', district='Abum')

        CONTACT.update({'districts': ['Wakiso', 'Abum']})

        ContactService.get.assert_called_once_with(CONTACT['_id'])
        ContactService.update.assert_called_once_with(CONTACT)

    @patch('eums.services.contact_service.ContactService.get')
    @patch('eums.services.contact_service.ContactService.update')
    def test_should_update_contact_when_contact_ips_modified(self, update, get):
        get.return_value = CONTACT
        update.return_value = 200

        ContactService.update_after_delivery_creation(CONTACT['_id'], type='End-user',
                                                      outcome='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                      ip='ABUM DHO', district='Wakiso')

        CONTACT.update({'ips': ['WAKISO DHO', 'ABUM DHO']})

        ContactService.get.assert_called_once_with(CONTACT['_id'])
        ContactService.update.assert_called_once_with(CONTACT)

    @patch('eums.services.contact_service.ContactService.get')
    @patch('eums.services.contact_service.ContactService.update')
    def test_should_update_contact_when_contact_outcomes_modified(self, update, get):
        get.return_value = CONTACT
        update.return_value = 200

        ContactService.update_after_delivery_creation(CONTACT['_id'], type='End-user',
                                                      outcome='YI101 - PCR 1 KEEP CHILDREN AND MOTHERS',
                                                      ip='WAKISO DHO', district='Wakiso')

        CONTACT.update(
            {'outcomes': ['YI105 - PCR 1 KEEP CHILDREN AND MOTHERS', 'YI101 - PCR 1 KEEP CHILDREN AND MOTHERS']})

        ContactService.get.assert_called_once_with(CONTACT['_id'])
        ContactService.update.assert_called_once_with(CONTACT)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    @patch('eums.services.contact_service.ContactService.build_rapid_pro_contact')
    def test_should_add_rapid_pro_contact_called(self, rapid_pro_contact):
        rapid_pro_contact.return_value = self.generate_build_rapid_pro_contact(CONTACT)
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value={'results': []}
        )))
        requests.post = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=CONTACT)))
        ContactService.add_or_update_rapid_pro_contact(CONTACT)

        self.assertTrue(requests.post.called)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    @patch('eums.services.contact_service.ContactService.build_rapid_pro_contact')
    def test_should_update_rapid_pro_contact_when_phone_not_modified(self, rapid_pro_contact):
        rapid_pro_contact.return_value = self.generate_build_rapid_pro_contact(CONTACT)
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(CONTACT))))

        new_contact = copy.deepcopy(CONTACT)
        new_contact.update({
            'prePhone': CONTACT['phone'],
            'phone': CONTACT['phone']
        })
        requests.post = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=new_contact)))

        ContactService.add_or_update_rapid_pro_contact(new_contact)

        self.assertTrue(requests.post.called)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    def test_should_update_rapid_pro_contact_when_phone_modified(self):
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_get_rapid_pro_contact_response(CONTACT))))

        new_contact = copy.deepcopy(CONTACT)
        new_phone = '+8618694029575'
        new_contact.update({
            'prePhone': CONTACT['phone'],
            'phone': new_phone
        })
        requests.post = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(CONTACT))))

        logger.info(new_contact)
        ContactService.add_or_update_rapid_pro_contact(new_contact)

        self.assertTrue(requests.post.called)

    @override_settings(RAPIDPRO_LIVE=False)
    def test_should_not_add_or_update_contact_when_rapid_pro_off(self):
        requests.get = MagicMock()
        requests.post = MagicMock()
        self.assertFalse(requests.get.called)
        self.assertFalse(requests.post.called)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    def test_should_delete_rapid_pro_contact(self):
        phone = '+8618192235667'
        url_delete_rapid_pro_contact = '%s?%s' % (settings.RAPIDPRO_URLS.get('CONTACTS'), urlencode({
            'urns': 'tel:%s' % phone
        }))
        requests.delete = MagicMock(return_value=MagicMock(status_code=HTTP_204_NO_CONTENT))
        response = ContactService.delete_rapid_pro_contact(phone)

        requests.delete.assert_called_once_with(url_delete_rapid_pro_contact, headers=HEADER,
                                                verify=settings.RAPIDPRO_SSL_VERIFY)
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)

    @override_settings(RAPIDPRO_LIVE=False)
    def test_should_not_delete_contact_when_rapid_pro_off(self):
        phone = '+8618192235667'
        requests.delete = MagicMock(return_value=MagicMock(status_code=HTTP_204_NO_CONTENT))
        ContactService.delete_rapid_pro_contact(phone)
        self.assertFalse(requests.delete.called)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERITY=False)
    def test_should_get_rapid_pro_contact_group(self):
        group_name = 'EUMS'
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=
            self.generate_rapid_pro_contact_group())))
        url_get_rapid_pro_contact_group = '%s?%s' % (settings.RAPIDPRO_URLS.get('GROUPS'), urlencode({
            'name': '%s' % group_name
        }))
        response = ContactService.get_rapid_pro_contact_group(group_name)
        requests.get.assert_called_once_with(url_get_rapid_pro_contact_group,
                                             headers=HEADER, verify=settings.RAPIDPRO_SSL_VERIFY)
        self.assertEqual(response.get('name'), 'EUMS')
        self.assertEqual(response.get('uuid'), '362bcb66-6f2e-4899-b78b-187309bdf636')

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    def test_should_get_rapid_pro_contact(self):
        first_name = "Jack"
        last_name = "Bob"
        phone = '+8618192235667'
        outcomes = ["YI105 - PCR 1 KEEP CHILDREN AND MOTHERS"]
        districts = ["Kampala"]
        ips = ["KAMPALA DHO, WAKISO DHO"]
        types = ["END_USER", "IMPLEMENTING_PARTNER"]

        params = {'urns': 'tel:%s' % phone}
        contact = self.generate_eums_contact(districts, first_name, ips, last_name, outcomes, phone, types)
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(contact))))
        response = ContactService.get_rapid_pro_contact(phone)

        requests.get.assert_called_once_with(settings.RAPIDPRO_URLS.get('CONTACTS'), data=json.dumps(params),
                                             headers=HEADER, verify=settings.RAPIDPRO_SSL_VERIFY)

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.json().get('groups')), 1)
        self.assertEqual(response.json().get('groups')[0], 'EUMS')

        fields = response.json().get("fields")
        self.assertEqual(fields.get('firstname'), first_name)
        self.assertEqual(fields.get('lastname'), last_name)
        self.assertEqual(fields.get('outcomes'), ','.join(outcomes))
        self.assertEqual(fields.get('districts'), ','.join(districts))
        self.assertEqual(fields.get('ips'), ','.join(ips))
        self.assertEqual(fields.get('types'), ','.join(["End-user", "IP"]))

    @override_settings(RAPIDPRO_LIVE=False)
    def test_should_not_get_contact_when_rapid_pro_off(self):
        phone = '+8618192235667'
        requests.get = MagicMock()
        ContactService.get_rapid_pro_contact(phone)
        self.assertFalse(requests.get.called)

    @override_settings(RAPIDPRO_LIVE=True, RAPIDPRO_SSL_VERIFY=False)
    @patch('eums.services.contact_service.ContactService.build_rapid_pro_contact')
    def test_should_add_rapid_pro_contact(self, rapid_pro_contact):
        first_name = "Jack"
        last_name = "Bob"
        phone = '+8618192235667'
        outcomes = ["YI105 - PCR 1 KEEP CHILDREN AND MOTHERS"]
        districts = ["Kampala"]
        ips = ["KAMPALA DHO, WAKISO DHO"]
        types = ["END_USER", "IMPLEMENTING_PARTNER"]

        contact = self.generate_eums_contact(districts, first_name, ips, last_name, outcomes, phone, types)
        rapid_pro_contact.return_value = self.generate_build_rapid_pro_contact(contact)
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value={'results': []}
        )))
        requests.post = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(
            return_value=self.generate_add_or_update_rapid_pro_contact_response(contact))))

        response = ContactService.add_or_update_rapid_pro_contact(contact)

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.json().get('groups')), 1)
        self.assertEqual(response.json().get('groups')[0], 'EUMS')

        fields = response.json().get("fields")
        self.assertEqual(fields.get('firstname'), first_name)
        self.assertEqual(fields.get('lastname'), last_name)
        self.assertEqual(fields.get('outcomes'), ','.join(outcomes))
        self.assertEqual(fields.get('districts'), ','.join(districts))
        self.assertEqual(fields.get('ips'), ','.join(ips))
        self.assertEqual(fields.get('types'), ','.join(["End-user", "IP"]))

        requests.post.assert_called_once_with(settings.RAPIDPRO_URLS.get('CONTACTS'),
                                              data=json.dumps(ContactService.build_rapid_pro_contact(contact)),
                                              headers=HEADER,
                                              verify=settings.RAPIDPRO_SSL_VERIFY)

    @override_settings(RAPIDPRO_LIVE=False)
    def test_should_not_add_contact_when_rapid_pro_off(self):
        requests.post = MagicMock()
        ContactService.add_or_update_rapid_pro_contact(CONTACT)
        self.assertFalse(requests.post.called)

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

    def generate_rapid_pro_contact_group(self):
        return {
            "next": None,
            "previous": None,
            "results": [
                {
                    "uuid": "362bcb66-6f2e-4899-b78b-187309bdf636",
                    "name": "EUMS",
                    "query": None,
                    "count": 60
                }
            ]
        }

    def generate_add_or_update_rapid_pro_contact_response(self, contact):
        return {
            "uuid": "e5de51c0-844b-4feb-8023-33b180bdf965",
            "name": "Jack Bob",
            "language": None,
            "group_uuids": ["fbc775f2-03e3-428e-93a2-608d7a7b46dc"],
            "urns": ["tel:%s" % contact.get('phone')],
            "fields": ContactService.build_rapid_pro_contact_fields(contact),
            "blocked": False,
            "failed": False,
            "modified_on": "2016-03-07T09:09:46.429Z",
            "phone": contact.get('phone'),
            "groups": ['EUMS']
        }

    def generate_get_rapid_pro_contact_response(self, contact):
        return {
            "results": [
                {
                    "uuid": "52fa33e7-da32-4703-8feb-aa5114dc1a8b",
                    "name": "Jack Bob",
                    "urns": [
                        "tel:%s" % contact.get('phone')
                    ],
                    "fields": ContactService.build_rapid_pro_contact_fields(contact)
                }
            ]
        }

    def generate_build_rapid_pro_contact(self, contact):
        return {
            'name': 'Jack Bob',
            'groups': [{'name': 'EUMS', 'uuid': '362bcb66-6f2e-4899-b78b-187309bdf636'}],
            'urns': ['tel:%s' % contact.get('phone')],
            'fields': ContactService.build_rapid_pro_contact_fields(contact)
        }