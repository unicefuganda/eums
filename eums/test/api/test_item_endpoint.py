from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN

from eums.test.api.api_test_helpers import create_item_unit, create_item
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.item_factory import ItemFactory

ENDPOINT_URL = BACKEND_URL + 'item/'


class ItemEndPointTest(AuthenticatedAPITestCase):
    def test_should_create_item(self):
        unit = create_item_unit(self)
        item_details = {'description': "Item 1", 'unit': unit['id'], 'material_code': "Item Code 1"}

        response = self.client.post(ENDPOINT_URL, item_details, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertDictContainsSubset(item_details, response.data)

    def test_should_search_item_by_description(self):
        item = ItemFactory(description='LX350')
        ItemFactory(description='AA')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'LX3'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(item.id, [item['id'] for item in response.data])

    def test_should_search_item_by_material_code(self):
        item = ItemFactory(material_code='LX350')
        ItemFactory(material_code='AA')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'LX3'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(item.id, [item['id'] for item in response.data])

    def test_should_get_all_items_sorted_by_description_for_non_ip_user(self):
        unit = create_item_unit(self)
        item_one_details = {'description': "B Item", 'unit': unit['id'], 'material_code': "Item Code B"}
        item_two_details = {'description': "A Item", 'unit': unit['id'], 'material_code': "Item Code A"}

        create_item(self, item_one_details)
        create_item(self, item_two_details)

        get_response = self.client.get(ENDPOINT_URL)

        self.assertEqual(get_response.status_code, 200)
        self.assertDictContainsSubset(item_two_details, get_response.data[0])
        self.assertDictContainsSubset(item_one_details, get_response.data[1])

    def test_unicef_admin_should_not_have_permission_to_view_item(self):
        self.log_and_assert_view_item_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_not_have_permission_to_view_item(self):
        self.log_and_assert_view_item_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_not_have_permission_to_view_item(self):
        self.log_and_assert_view_item_permission(self.log_unicef_viewer_in, HTTP_200_OK)

    def test_ip_editor_should_have_permission_to_view_item(self):
        self.log_and_assert_view_item_permission(self.log_ip_editor_in, HTTP_200_OK)

    def test_ip_viewer_should_have_permission_to_view_item(self):
        self.log_and_assert_view_item_permission(self.log_ip_viewer_in, HTTP_200_OK)

    def log_and_assert_view_item_permission(self, log_func, status_code):
        log_func()
        self.assertEqual(self.client.get(ENDPOINT_URL).status_code, status_code)
