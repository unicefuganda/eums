from unittest import TestCase

from django.conf import settings
import requests

from eums.fixtures.flows import seed_flows
from eums.models import Flow


class RapidProSmoke(TestCase):
    def setUp(self):
        self.headers = {'Authorization': "Token %s" % settings.RAPIDPRO_API_TOKEN}

    @classmethod
    def setUpClass(cls):
        seed_flows()

    @classmethod
    def tearDownClass(cls):
        Flow.objects.all().delete()

    def test_runs_endpoint_is_up(self):
        response = requests.get(settings.RAPIDPRO_URLS['RUNS'], headers=self.headers)
        self.assertEqual(response.status_code, 200)

    def test_flows_specified_in_settings_exist(self):
        response = requests.get(settings.RAPIDPRO_URLS['FLOWS'], headers=self.headers)
        self.assertEqual(response.status_code, 200)
        flows = Flow.objects.all()
        for flow in flows:
            self.assertTrue(self.flow_exists(flow.rapid_pro_id, response.json()['results']))

    def flow_exists(self, flow_id, flows):
        matching_flows = filter(lambda flow: flow['flow'] == flow_id, flows)
        return len(matching_flows) == 1

        # TODO Test that flow takes the parameters we provide when RapidPro API makes the @extra.* fields available