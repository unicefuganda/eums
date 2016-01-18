from eums.auth import CustomerPermissionCode
from eums.management.commands.setup_permissions import *
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase


class PermissionsTest(PermissionsTestCase):
    def test_grant_correct_view_purchase_order_permission(self):
        unicef_admin_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_ADMIN]
        unicef_editor_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_EDITOR]
        unicef_viewer_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_VIEWER]
        ip_editor_permissions = GROUP_PERMISSIONS[GROUP_IP_EDITOR]
        ip_viewer_permissions = GROUP_PERMISSIONS[GROUP_IP_VIEWER]

        permission_to_test = CustomerPermissionCode.CAN_VIEW_RELEASE_ORDER

        self.assertTrue(permission_to_test in unicef_admin_permissions)
        self.assertTrue(permission_to_test in unicef_editor_permissions)
        self.assertTrue(permission_to_test in unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in ip_editor_permissions)
        self.assertTrue(permission_to_test not in ip_viewer_permissions)

    def test_grant_correct_view_release_order_permission(self):
        unicef_admin_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_ADMIN]
        unicef_editor_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_EDITOR]
        unicef_viewer_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_VIEWER]
        ip_editor_permissions = GROUP_PERMISSIONS[GROUP_IP_EDITOR]
        ip_viewer_permissions = GROUP_PERMISSIONS[GROUP_IP_VIEWER]

        permission_to_test = CustomerPermissionCode.CAN_VIEW_RELEASE_ORDER

        self.assertTrue(permission_to_test in unicef_admin_permissions)
        self.assertTrue(permission_to_test in unicef_editor_permissions)
        self.assertTrue(permission_to_test in unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in ip_editor_permissions)
        self.assertTrue(permission_to_test not in ip_viewer_permissions)
