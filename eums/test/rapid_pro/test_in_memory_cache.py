import json
from unittest import TestCase

import requests
from django.conf import settings
from mock import MagicMock, patch
from requests import Response

from eums.models import Flow
from eums.rapid_pro.rapid_pro_service import RapidProInMemoryCache
from eums.test.helpers.model_builder import ModelBuilder

FLOW_ID = 19772


class TestInMemoryCache(TestCase):
    def setUp(self):
        self.cache = RapidProInMemoryCache()
        self.expected_headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN,
                                 'Content-Type': 'application/json'}

    def test_should_sync_from_rapid_pro_when_flow_id_is_not_cached(self):
        flow = ModelBuilder(Flow, label=Flow.Label.IMPLEMENTING_PARTNER).instance

        response = ModelBuilder(Response, status_code=200,
                                json=MagicMock(return_value=json.loads(open('flow.json').read()))).instance

        requests.get = MagicMock(return_value=response)

        self.assertEqual(FLOW_ID, self.cache.flow_id(flow))
        self.assertTrue(FLOW_ID in self.cache.flow_id_label_mapping)
        self.assertTrue(Flow.Label.IMPLEMENTING_PARTNER in self.cache.cache_flow_mapping)

    @patch('eums.models.Flow.objects.filter')
    @patch('requests.get')
    def test_should_sync_when_flow_expired(self, mocked_get, mocked_filter):
        response = ModelBuilder(Response, status_code=200,
                                json=MagicMock(return_value=json.loads(open('flow.json').read()))).instance

        requests.get = MagicMock(return_value=response)

        self.cache.flow(FLOW_ID)

        mocked_filter.assert_called_with(label__in=[Flow.Label.IMPLEMENTING_PARTNER])
