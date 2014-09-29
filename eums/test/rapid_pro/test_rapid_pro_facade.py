from unittest import TestCase

from mockito import when, verify
import requests
from django.conf import settings

from eums.rapid_pro.rapid_pro_facade import start_delivery_run
from eums.test.helpers.fake_response import FakeResponse


class RapidProFacadeTest(TestCase):
    def setUp(self):
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}
        self.item_description = "Plumpynut"
        self.sender = 'Save the Children'
        self.expected_payload = {
            "flow": settings.RAPIDPRO_FLOW_ID,
            "phone": [self.contact['phone']],
            "extra": {
                settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: self.contact['first_name'] + self.contact['last_name'],
                settings.RAPIDPRO_EXTRAS['SENDER']: self.sender,
                settings.RAPIDPRO_EXTRAS['PRODUCT']: self.item_description
            }
        }
        fake_json = [{"run": 1, "phone": self.contact['phone']}]
        when(requests).post(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload).thenReturn(
            FakeResponse(fake_json, 201))

    def test_should_start_a_flow_run_for_a_contact(self):
        expected_headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}
        start_delivery_run(consignee=self.contact, item_description=self.item_description, sender=self.sender)
        print '*' * 20, 'EXPECTED HEADER', expected_headers, '*' * 20
        verify(requests).post(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload, headers=expected_headers)
        print '*' * 20, 'URL', settings.RAPIDPRO_URLS['RUNS'], '*' * 20
