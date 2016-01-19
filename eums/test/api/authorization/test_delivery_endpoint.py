from httplib import FORBIDDEN

from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DeliveryEndpointTest(AuthenticatedAPITestCase):
    def test_should_allow_unicef_admin_to_track_delivery(self):
        self.log_and_assert_track_delivery_permission(self.log_unicef_admin_in, FORBIDDEN)

    def test_should_allow_unicef_editor_to_track_delivery(self):
        self.log_and_assert_track_delivery_permission(self.log_unicef_editor_in, FORBIDDEN)

    def test_should_not_allow_unicef_viewer_to_track_delivery(self):
        self.log_and_assert_track_delivery_permission(self.log_unicef_viewer_in, FORBIDDEN)

    def test_should_not_allow_implementing_partner_editors_to_track_delivery(self):
        self.log_and_assert_track_delivery_permission(self.log_ip_viewer_in, FORBIDDEN)

    def test_should_not_allow_implementing_partner_viewers_to_track_delivery(self):
        self.log_and_assert_track_delivery_permission(self.log_ip_editor_in, FORBIDDEN)

    def log_and_assert_track_delivery_permission(self, log_func, expected_status_code):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        delivery = DeliveryFactory(programme=programme, consignee=consignee, location='Kampala',
                                   delivery_date='2015-12-12')

        log_func()

        response = self.client.put(ENDPOINT_URL + str(delivery.id) + '/', {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id',
            'track': 'true'
        })

        self.assertEqual(response.status_code, expected_status_code)
