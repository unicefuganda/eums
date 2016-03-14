from urllib import urlencode

import requests
from django.test import override_settings
from mock import MagicMock
from rest_framework.status import HTTP_200_OK

from eums.services.contact_service import execute_rapid_pro_contact_update, execute_rapid_pro_contact_delete, \
    ContactService
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'contacts/'

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


class ContactEndpointTest(AuthenticatedAPITestCase):
    @override_settings(CELERY_LIVE=True)
    def test_should_update_rapid_pro_contact(self):
        self.log_unicef_admin_in()

        execute_rapid_pro_contact_update.delay = MagicMock()
        ContactService.update = MagicMock(return_value=HTTP_200_OK)
        first_name = "Jack"
        last_name = "Bob"
        phone = '+8618192235667'
        outcomes = ["YI105 - PCR 1 KEEP CHILDREN AND MOTHERS"]
        districts = ["Kampala"]
        ips = ["KAMPALA DHO, WAKISO DHO"]
        types = ["End-user, IP-consignee"]

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
        response = self.client.put(ENDPOINT_URL, data=contact)
        self.assertEqual(response.status_code, HTTP_200_OK)

    @override_settings(CELERY_LIVE=True)
    def test_should_delete_rapid_pro_contact(self):
        self.log_unicef_admin_in()
        requests.get = MagicMock(return_value=MagicMock(status_code=200, json=MagicMock(return_value=CONTACT)))

        execute_rapid_pro_contact_delete.delay = MagicMock()

        response = self.client.delete('%s%s/' % (ENDPOINT_URL, '8jasf89322oioufdsfhdsbfds'))

        execute_rapid_pro_contact_delete.delay.assert_called_once_with(CONTACT['phone'])
        self.assertEqual(response.status_code, HTTP_200_OK)

    @override_settings(CELERY_LIVE=True)
    def test_should_search_contact_by_phone(self):
        self.log_unicef_admin_in()
        ContactService.search = MagicMock(return_value=CONTACT)

        response = self.client.get('%s?%s' % (ENDPOINT_URL, 'searchfield=John'))

        ContactService.search.assert_called_once_with('John')

        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data, CONTACT)
