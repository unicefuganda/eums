from eums.auth import PermissionCode
from eums.management.commands.setup_permissions import *
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase


class PermissionsTest(PermissionsTestCase):
    def setUp(self):
        self.unicef_admin_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_ADMIN]
        self.unicef_editor_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_EDITOR]
        self.unicef_viewer_permissions = GROUP_PERMISSIONS[GROUP_UNICEF_VIEWER]
        self.ip_editor_permissions = GROUP_PERMISSIONS[GROUP_IP_EDITOR]
        self.ip_viewer_permissions = GROUP_PERMISSIONS[GROUP_IP_VIEWER]

    def test_grant_correct_view_purchase_order_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_RELEASE_ORDER

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_release_order_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_RELEASE_ORDER

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_add_distribution_plan_permission(self):
        permission_to_test = PermissionCode.CAN_ADD_DISTRIBUTION_PLAN

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_change_change_permission(self):
        permission_to_test = PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)


    def test_grant_correct_view_distribution_plan_node_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test in self.ip_viewer_permissions)

    def test_grant_correct_view_alert_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_ALERT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_change_alert_permission(self):
        permission_to_test = PermissionCode.CAN_PATCH_ALERT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

