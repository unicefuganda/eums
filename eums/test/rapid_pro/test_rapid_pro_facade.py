from unittest import TestCase

from mockito import when, verify
import requests
from eums.rapid_pro.rapid_pro_facade import start_delivery_flow

from eums.settings import RAPIDPRO_URLS, RAPIDPRO_FLOW_ID, RAPIDPRO_EXTRAS, DATABASES
print "*" * 20, "Databases in settings = ", DATABASES, "*" * 20
from eums.test.helpers.fake_response import FakeResponse


class RapidProFacadeTest(TestCase):
    def setUp(self):
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}
        self.item_description = "Plumpynut"
        self.sender = 'Save the Children'
        self.expected_payload = {
            "flow": RAPIDPRO_FLOW_ID,
            "phone": [self.contact['phone']],
            "extra": {
                RAPIDPRO_EXTRAS['CONTACT_NAME']: self.contact['first_name'] + self.contact['last_name'],
                RAPIDPRO_EXTRAS['SENDER']: self.sender,
                RAPIDPRO_EXTRAS['PRODUCT']: self.item_description
            }
        }
        fake_json = [{"run": 1, "phone": self.contact['phone']}]
        when(requests).post(RAPIDPRO_URLS['RUNS'], data=self.expected_payload).thenReturn(FakeResponse(fake_json, 201))

    def test_should_start_a_flow_run_for_a_contact(self):
        start_delivery_flow(consignee=self.contact, item_description=self.item_description, sender=self.sender)
        verify(requests).post(RAPIDPRO_URLS['RUNS'], data=self.expected_payload)