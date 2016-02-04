from rest_framework import status

from eums.models.system_settings import SystemSettings
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.system_settings_factory import SystemSettingsFactory

ENDPOINT_URL = BACKEND_URL + 'system-settings/'


class SystemSettingsTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(SystemSettingsTest, self).setUp()

    def test_turn_off_auto_track_switch_should_return_false(self):
        system_settings = SystemSettingsFactory(auto_track=True)
        response = self.client.put(ENDPOINT_URL + str(system_settings.id) + '/', {
            'auto_track': False
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(SystemSettings.objects.get(pk=system_settings.id).auto_track)

    def test_turn_on_auto_track_switch_should_return_true(self):
        system_settings = SystemSettingsFactory(auto_track=False)
        response = self.client.put(ENDPOINT_URL + str(system_settings.id) + '/', {
            'auto_track': True
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(SystemSettings.objects.get(pk=system_settings.id).auto_track)

    def test_get_auto_track_switch_should_return_true(self):
        system_settings = SystemSettingsFactory(auto_track=True)
        response = self.client.get(ENDPOINT_URL + str(system_settings.id) + '/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        auto_track = response.data.get('auto_track')
        self.assertTrue(auto_track)

    def test_get_auto_track_switch_should_return_false(self):
        system_settings = SystemSettingsFactory(auto_track=False)
        response = self.client.get(ENDPOINT_URL + str(system_settings.id) + '/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data.get('auto_track'))

    def test_get_default_subdivision_name_should_return_district(self):
        system_settings = SystemSettingsFactory(district_label="District")
        response = self.client.get(ENDPOINT_URL + str(system_settings.id) + '/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('district_label'), "District")
