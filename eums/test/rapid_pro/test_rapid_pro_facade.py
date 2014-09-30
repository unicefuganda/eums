from unittest import TestCase

from mockito import when, verify, any
import requests
from django.conf import settings

from eums.rapid_pro import fake_rapid_pro
from eums.rapid_pro.rapid_pro_facade import start_delivery_run
from eums.rapid_pro.fake_response import FakeResponse


contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}
item_description = "Plumpynut"
sender = 'Save the Children'


class RapidProFacadeTestWithRapidProLive(TestCase):
    def setUp(self):
        self.original_rapid_pro_live_setting = settings.RAPIDPRO_LIVE
        settings.RAPIDPRO_LIVE = True

        self.expected_payload = {
            "flow": settings.RAPIDPRO_FLOW_ID,
            "phone": [contact['phone']],
            "extra": {
                settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: contact['first_name'] + contact['last_name'],
                settings.RAPIDPRO_EXTRAS['SENDER']: sender,
                settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
            }
        }
        fake_json = [{"run": 1, "phone": contact['phone']}]

        when(requests).post(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload).thenReturn(
            FakeResponse(fake_json, 201))

    def test_should_start_a_flow_run_for_a_contact(self):
        print "*" * 20, "[In test with live] Rapid pro live = ", settings.RAPIDPRO_LIVE, "*" * 20
        expected_headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}
        start_delivery_run(consignee=contact, item_description=item_description, sender=sender)
        verify(requests).post(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload, headers=expected_headers)

    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.original_rapid_pro_live_setting
        

class RapidProFacadeTestWithRapidProNotLive(TestCase):
    def setUp(self):
        self.original_rapid_pro_live_setting = settings.RAPIDPRO_LIVE
        settings.RAPIDPRO_LIVE = False
        when(fake_rapid_pro.runs).post(data=any()).thenReturn(None)
    
    def test_should_post_to_fake_rapid_pro_when_starting_a_run(self):
        print "*" * 20, "[In test not live] Rapid pro live = ", settings.RAPIDPRO_LIVE, "*" * 20
        start_delivery_run(consignee=contact, item_description=item_description, sender=sender)
        verify(fake_rapid_pro.runs).post(data=any())
    
    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.original_rapid_pro_live_setting