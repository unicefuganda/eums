from unittest import TestCase

from mock import patch
from django.conf import settings
from eums.models import DistributionPlanNode

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
            "flow": settings.RAPIDPRO_FLOWS['END_USER'],
            "phone": [contact['phone']],
            "extra": {
                settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: contact['first_name'] + contact['last_name'],
                settings.RAPIDPRO_EXTRAS['SENDER']: sender,
                settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
            }
        }

        self.runs_url = settings.RAPIDPRO_URLS['RUNS']
        self.fake_json = [{"run": 1, "phone": contact['phone']}]

    @patch('requests.post')
    def test_should_start_a_flow_run_for_a_contact(self, mock_post):
        mock_post.return_value = FakeResponse(self.fake_json, 201)
        expected_headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}
        start_delivery_run(consignee=contact, item_description=item_description, sender=sender,
                           flow=settings.RAPIDPRO_FLOWS['END_USER'])
        mock_post.assert_called_with(settings.RAPIDPRO_URLS['RUNS'], data=self.expected_payload,
                                     headers=expected_headers)

    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.original_rapid_pro_live_setting


class RapidProFacadeTestWithRapidProNotLive(TestCase):
    def setUp(self):
        self.original_rapid_pro_live_setting = settings.RAPIDPRO_LIVE
        settings.RAPIDPRO_LIVE = False

    @patch('eums.rapid_pro.fake_endpoints.runs.post')
    def test_should_post_to_fake_rapid_pro_when_starting_a_run(self, mock_post):
        mock_post.return_value = None
        start_delivery_run(consignee=contact, item_description=item_description, sender=sender,
                           flow=settings.RAPIDPRO_FLOWS['MIDDLE_MAN'])
        mock_post.assert_called()

    def tearDown(self):
        settings.RAPIDPRO_LIVE = self.original_rapid_pro_live_setting