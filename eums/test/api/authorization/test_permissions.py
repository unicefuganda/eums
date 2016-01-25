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

    def test_grant_correct_view_distribution_plan_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_distribution_plan_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_DISTRIBUTION_PLANS

        self.assertTrue(permission_to_test not in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test in self.ip_viewer_permissions)

    def test_grant_correct_add_distribution_plan_permission(self):
        permission_to_test = PermissionCode.CAN_ADD_DISTRIBUTION_PLAN

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_change_distribution_plan_permission(self):
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

    def test_grant_correct_view_system_settings_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_SYSTEM_SETTINGS

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test in self.ip_viewer_permissions)

    def test_grant_correct_change_system_settings_permission(self):
        permission_to_test = PermissionCode.CAN_CHANGE_SYSTEM_SETTINGS

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_user_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_USER

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_change_user_permission(self):
        permission_to_test = PermissionCode.CAN_CHANGE_USER

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_consignee_item_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_CONSIGNEE_ITEM

        self.assertTrue(permission_to_test not in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test in self.ip_viewer_permissions)

    def test_grant_correct_view_stock_report_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_STOCK_REPORT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test in self.ip_viewer_permissions)

    def test_grant_correct_view_delivery_feedback_report_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_DELIVERY_FEEDBACK_REPORT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_item_feedback_report_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_ITEM_FEEDBACK_REPORT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_supply_efficiency_report_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_SUPPLY_EFFICIENCY_REPORT

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test not in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_add_distribution_node_permission(self):
        permission_to_test = PermissionCode.CAN_ADD_DISTRIBUTION_PLAN_NODE

        self.assertTrue(permission_to_test in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_view_item_permission(self):
        permission_to_test = PermissionCode.CAN_VIEW_ITEM

        self.assertTrue(permission_to_test not in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)

    def test_grant_correct_add_web_answer_permission(self):
        permission_to_test = PermissionCode.CAN_ADD_WEB_ANSWER

        self.assertTrue(permission_to_test not in self.unicef_admin_permissions)
        self.assertTrue(permission_to_test not in self.unicef_editor_permissions)
        self.assertTrue(permission_to_test not in self.unicef_viewer_permissions)
        self.assertTrue(permission_to_test in self.ip_editor_permissions)
        self.assertTrue(permission_to_test not in self.ip_viewer_permissions)
