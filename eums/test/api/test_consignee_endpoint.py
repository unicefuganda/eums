import logging

from django.contrib.auth.models import User
from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN, HTTP_201_CREATED, HTTP_301_MOVED_PERMANENTLY, \
    HTTP_204_NO_CONTENT

from eums.auth import GROUP_IP_EDITOR
from eums.models import Consignee, DistributionPlan
from eums.test.api.api_test_helpers import create_consignee, create_user_with_group
from eums.test.api.authorization.authenticated_api_test_case import AuthenticatedAPITestCase, IP_EDITOR
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as DeliveryNodeFactory

ENDPOINT_URL = BACKEND_URL + 'consignee/'
logger = logging.getLogger(__name__)


class ConsigneeEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(ConsigneeEndpointTest, self).setUp()
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def test_should_get_consignees_sorted_by_name(self):
        consignee_one_details = {'name': "Save the Children", 'type': "implementing_partner",
                                 'customer_id': 'L100', 'imported_from_vision': True}
        consignee_two_details = {'name': "Feed the Children", 'type': "implementing_partner",
                                 'customer_id': '', 'imported_from_vision': False}

        create_consignee(self, consignee_one_details)
        create_consignee(self, consignee_two_details)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(consignee_two_details, response.data[0])
        self.assertDictContainsSubset(consignee_one_details, response.data[1])

    def test_should_get_consignee_deliveries(self):
        consignee = ConsigneeFactory()
        detail_route = '%s%d/deliveries/' % (ENDPOINT_URL, consignee.id)
        self.assertListEqual(self.client.get(detail_route).data, [])

        node_one = DeliveryNodeFactory(consignee=consignee)
        node_two = DeliveryNodeFactory(consignee=consignee)

        consignee_node_ids = self.client.get(detail_route).data

        self.assertEqual(len(consignee_node_ids), 2)
        self.assertIn(node_one.id, consignee_node_ids)
        self.assertIn(node_two.id, consignee_node_ids)

    def test_should_search_consignee_by_customer_id(self):
        consignee = ConsigneeFactory(customer_id='LX350')
        ConsigneeFactory(customer_id='AA')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'LX3'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_search_consignee_by_name(self):
        consignee = ConsigneeFactory(name='Save all of the children')
        ConsigneeFactory(name='consignee')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'all of the'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_search_consignee_by_location(self):
        consignee = ConsigneeFactory(location='Some Village')
        ConsigneeFactory(location='Luwafu')
        response = self.client.get('%s?search=%s' % (ENDPOINT_URL, 'village'))
        self.assertEqual(len(response.data), 1)
        self.assertIn(consignee.id, [consignee['id'] for consignee in response.data])

    def test_should_allow_post_of_consignee_with_only_name(self):
        consignee_one_details = {'name': "Other Children NGO"}
        response = self.client.post(ENDPOINT_URL, data=consignee_one_details)
        self.assertEqual(response.status_code, 201)

    def test_should_filter_consignees_by_imported_from_vision_flag(self):
        vision_consignee = ConsigneeFactory(imported_from_vision=True)
        ConsigneeFactory(imported_from_vision=False)

        response = self.client.get(ENDPOINT_URL + '?imported_from_vision=True')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], vision_consignee.id)

    def test_should_not_cache_consignees(self):
        first_consignee = create_consignee({'name': "Save the Children", 'type': 'implementing_partner'})
        create_consignee({'name': "Masaka DHO", 'type': 'middle_man'})
        create_consignee({'name': "Gulu DHO", 'type': 'middle_man'})

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)
        Consignee.objects.get(id=first_consignee['id']).delete()

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_should_paginate_consignee_list_on_request(self):
        ConsigneeFactory()
        ConsigneeFactory()
        response = self.client.get('%s?paginate=true' % ENDPOINT_URL)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('pageSize', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_not_paginate_consignee_list_when_paginate_is_not_true(self):
        response = self.client.get('%s?paginate=falsy' % ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('results', response.data)
        self.assertEqual(response.data, [])

    def test_unicef_admin_should_have_permission_to_view_consignee(self):
        self.log_and_assert_view_consignee_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_have_permission_to_view_consignee(self):
        self.log_and_assert_view_consignee_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_have_permission_to_view_consignee(self):
        self.log_and_assert_view_consignee_permission(self.log_unicef_viewer_in, HTTP_200_OK)

    def test_ip_editor_should_have_permission_to_view_consignee(self):
        self.log_and_assert_view_consignee_permission(self.log_ip_editor_in, HTTP_200_OK)

    def test_ip_viewer_should_have_permission_to_view_consignee(self):
        self.log_and_assert_view_consignee_permission(self.log_ip_viewer_in, HTTP_200_OK)

    def log_and_assert_view_consignee_permission(self, log_func, status_code):
        log_func()
        self.assertEqual(self.client.get(ENDPOINT_URL).status_code, status_code)

    def test_unicef_admin_should_have_permission_to_add_consignee(self):
        self.log_and_assert_add_consignee_permission(self.log_unicef_admin_in, HTTP_201_CREATED)

    def test_unicef_editor_should_have_permission_to_add_consignee(self):
        self.log_and_assert_add_consignee_permission(self.log_unicef_editor_in, HTTP_201_CREATED)

    def test_unicef_viewer_should_not_have_permission_to_add_consignee(self):
        self.log_and_assert_add_consignee_permission(self.log_unicef_viewer_in, HTTP_403_FORBIDDEN)

    def test_ip_editor_should_have_permission_to_add_consignee(self):
        self.log_and_assert_add_consignee_permission(self.log_ip_editor_in, HTTP_201_CREATED)

    def test_ip_viewer_should_not_have_permission_to_add_consignee(self):
        self.log_and_assert_add_consignee_permission(self.log_ip_viewer_in, HTTP_403_FORBIDDEN)

    def log_and_assert_add_consignee_permission(self, log_func, status_code):
        log_func()
        consignee_one_details = {'name': "Other Children NGO"}
        self.assertEqual(self.client.post(ENDPOINT_URL, data=consignee_one_details).status_code, status_code)

    def test_unicef_admin_should_have_permission_to_change_consignee(self):
        self.log_and_assert_change_consignee_permission(self.log_unicef_admin_in, HTTP_200_OK)

    def test_unicef_editor_should_have_permission_to_change_consignee(self):
        self.log_and_assert_change_consignee_permission(self.log_unicef_editor_in, HTTP_200_OK)

    def test_unicef_viewer_should_not_have_permission_to_change_consignee(self):
        self.log_and_assert_change_consignee_permission(self.log_unicef_viewer_in, HTTP_403_FORBIDDEN)

    def test_ip_editor_should_have_permission_to_change_consignee(self):
        self.log_and_assert_change_consignee_permission(self.log_ip_editor_in, HTTP_200_OK)

    def test_ip_viewer_should_not_have_permission_to_change_consignee(self):
        self.log_and_assert_change_consignee_permission(self.log_ip_viewer_in, HTTP_403_FORBIDDEN)

    def log_and_assert_change_consignee_permission(self, log_func, status_code):
        log_func()
        consignee = ConsigneeFactory(location='Some Village',
                                     created_by_user=User.objects.filter(id=1).first())
        request_body = {
            'name': 'Other Children NGO',
            'remarks': 'modified remarks'
        }
        logger.info(ENDPOINT_URL + str(consignee.id))
        self.assertEqual(self.client.put(ENDPOINT_URL + str(consignee.id) + '/', request_body).status_code,
                         status_code)

    def test_unicef_admin_should_have_permission_to_delete_consignee(self):
        self.log_and_assert_delete_consignee_permission(self.log_unicef_admin_in, HTTP_204_NO_CONTENT)

    def test_unicef_editor_should_have_permission_to_delete_consignee(self):
        self.log_and_assert_delete_consignee_permission(self.log_unicef_editor_in, HTTP_204_NO_CONTENT)

    def test_unicef_viewer_should_not_have_permission_to_delete_consignee(self):
        self.log_and_assert_delete_consignee_permission(self.log_unicef_viewer_in, HTTP_403_FORBIDDEN)

    def test_ip_editor_should_have_permission_to_delete_consignee(self):
        self.log_and_assert_delete_consignee_permission(self.log_ip_editor_in, HTTP_204_NO_CONTENT)

    def test_ip_viewer_should_not_have_permission_to_delete_consignee(self):
        self.log_and_assert_delete_consignee_permission(self.log_ip_viewer_in, HTTP_403_FORBIDDEN)

    def log_and_assert_delete_consignee_permission(self, log_func, status_code):
        log_func()
        consignee = ConsigneeFactory(location='Some Village',
                                     created_by_user=User.objects.filter(id=1).first())
        logger.info(ENDPOINT_URL + str(consignee.id))
        self.assertEqual(self.client.delete(ENDPOINT_URL + str(consignee.id) + '/').status_code,
                         status_code)
