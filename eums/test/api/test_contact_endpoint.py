import json
from urllib import urlencode

import requests
from django.test import override_settings
from mock import MagicMock
from rest_framework.status import HTTP_200_OK

from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.util.contact_client import execute_rapid_pro_contact_update, execute_rapid_pro_contact_delete

ENDPOINT_URL = BACKEND_URL + 'contacts/'


class ContactEndpointTest(AuthenticatedAPITestCase):

    @override_settings(CELERY_LIVE=True)
    def test_should_update_rapid_pro_contact(self):
        self.log_unicef_admin_in()
        execute_rapid_pro_contact_update.delay = MagicMock()
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
        response = self.client.post(ENDPOINT_URL, data=contact)
        self.assertEqual(response.status_code, HTTP_200_OK)

    @override_settings(CELERY_LIVE=True)
    def test_should_delete_rapid_pro_contact(self):
        self.log_unicef_admin_in()
        phone = '+8618192235667'
        execute_rapid_pro_contact_delete.delay = MagicMock()

        response = self.client.delete('%s?%s' % (ENDPOINT_URL, urlencode({'phone': phone})))

        execute_rapid_pro_contact_delete.delay.assert_called_once_with(phone)
        self.assertEqual(response.status_code, HTTP_200_OK)
