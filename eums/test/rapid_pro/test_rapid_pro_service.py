import json
from unittest import TestCase

import requests
from mock import patch, Mock

from django.conf import settings
from eums.models import Flow
from eums.rapid_pro.rapid_pro_service import RapidProService

FLOW_ID = 123

contact = {'firstName': 'Test', 'lastName': 'User', 'phone': '+256 772 123456'}
item = "Plumpynut"
sender = 'Save the Children'


class TestRapidProService(TestCase):
    def setUp(self):
        self.settings_rapid_pro_live = settings.RAPIDPRO_LIVE
        settings.RAPIDPRO_LIVE = True
        self.expected_headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN,
                                 'Content-Type': 'application/json'}
        self.expected_payload = json.dumps({
            "flow": FLOW_ID,
            "phone": ['+256 772 123456'],
            "extra": {'contactName': 'Test User', 'sender': sender, 'product': item}
        })

    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.settings_rapid_pro_live

    @patch('eums.rapid_pro.rapid_pro_service.logger.info')
    @patch('requests.post')
    def test_should_create_run(self, mocked_post, *_):
        rapid_pro_service = RapidProService()
        RapidProService.cache.flow_id = Mock(return_value=FLOW_ID)

        rapid_pro_service.create_run(Flow(), contact, sender=sender, item=item)
        mocked_post.assert_called_with(settings.RAPIDPRO_URLS['RUNS'],
                                       data=self.expected_payload,
                                       headers=self.expected_headers)
