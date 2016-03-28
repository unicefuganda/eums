import json
import os
from unittest import TestCase

import requests
from django.conf import settings
from django.test import override_settings
from mock import patch, MagicMock
from requests import Response
from eums.models import Flow
from eums.rapid_pro.rapid_pro_service import RapidProService
from eums.test.helpers.model_builder import ModelBuilder

HEADER = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN, 'Content-Type': 'application/json'}
FLOW_ID = 19772

contact = {'firstName': 'Test', 'lastName': 'User', 'phone': '+256 772 123456'}
item = 'Plumpynut'
sender = 'Save the Children'


class TestRapidProService(TestCase):
    def setUp(self):
        self.rapid_pro_service = RapidProService()
        self.settings_rapid_pro_live = settings.RAPIDPRO_LIVE
        settings.RAPIDPRO_LIVE = True
        self.expected_payload = json.dumps({
            'flow': FLOW_ID,
            'phone': ['+256 772 123456'],
            'extra': {'contactName': 'Test User', 'sender': sender, 'product': item}
        })

        self.response = ModelBuilder(Response, status_code=200,
                                     json=MagicMock(return_value=json.loads(
                                         open(os.path.join(os.path.dirname(__file__), 'flow.json')).read()))).instance

    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.settings_rapid_pro_live

    @patch('eums.rapid_pro.rapid_pro_service.logger.info')
    @patch('requests.post')
    @override_settings(RAPIDPRO_SSL_VERIFY=False)
    def test_should_create_run(self, mocked_post, *_):
        self.rapid_pro_service.cache = MagicMock(expired=False,
                                                 flow_label_mapping={FLOW_ID: [Flow.Label.IMPLEMENTING_PARTNER]})

        flow = ModelBuilder(Flow, label=Flow.Label.IMPLEMENTING_PARTNER).instance
        self.rapid_pro_service.create_run(contact, flow, item, sender)
        mocked_post.assert_called_with(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload, headers=HEADER,
                                       verify=settings.RAPIDPRO_SSL_VERIFY)

    @patch('eums.rapid_pro.rapid_pro_service.logger.info')
    @patch('eums.models.Flow.objects.filter')
    @override_settings(RAPIDPRO_SSL_VERIFY=False)
    def test_should_sync_flow(self, mock_filter, _):
        requests.get = MagicMock(return_value=self.response)

        self.rapid_pro_service.flow(FLOW_ID)

        requests.get.assert_called_with(settings.RAPIDPRO_URLS['FLOWS'], headers=HEADER,
                                        verify=settings.RAPIDPRO_SSL_VERIFY)

        mock_filter.assert_called_with(label__in=[Flow.Label.IMPLEMENTING_PARTNER])

    @patch('eums.rapid_pro.rapid_pro_service.logger.info')
    def test_should_get_middle_man_flow_id(self, _):
        requests.get = MagicMock(return_value=self.response)
        self.rapid_pro_service.flow(FLOW_ID)
        mock_flow = MagicMock(label='MIDDLE_MAN')

        flow_id = self.rapid_pro_service.flow_id(mock_flow)

        self.assertEquals(flow_id, 19773)
