from rest_framework.test import APITestCase

from eums.management.commands.setup_permissions import *


class PermissionsTest(APITestCase):
    def test_ip_editor_should_not_have_view_purchase_order(self):
        unicef_admin_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_ADMIN]
        unicef_editor_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_EDITOR]
        unicef_viewer_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_VIEWER]
        ip_editor_permissions = GROUP_PERMISSIONS[GROUP_IP_EDITOR]
        ip_viewer_permissions = GROUP_PERMISSIONS[GROUP_IP_VIEWER]

        permission_to_test = 'can_view_purchase_order'

        self.assertTrue(permission_to_test in unicef_admin_permissions)
        self.assertTrue(permission_to_test in unicef_editor_permissions)
        self.assertTrue(permission_to_test in unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in ip_editor_permissions)
        self.assertTrue(permission_to_test not in ip_viewer_permissions)
