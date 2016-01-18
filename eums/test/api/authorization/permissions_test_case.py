from django.core.management import call_command
from rest_framework.test import APITestCase

from eums.auth import create_groups, create_permissions
from eums.management.commands import setup_permissions


class PermissionsTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        create_groups()
        create_permissions()
        call_command('setup_permissions')

    def test_ip_editor_should_not_have_view_purchase_order(self):
        unicef_admin_permissions = setup_permissions.GROUP_PERMISSIONS['UNICEF_admin']
        unicef_editor_permissions = setup_permissions.GROUP_PERMISSIONS['UNICEF_editor']
        unicef_viewer_permissions = setup_permissions.GROUP_PERMISSIONS['UNICEF_viewer']
        ip_editor_permissions = setup_permissions.GROUP_PERMISSIONS['Implementing Partner_editor']
        ip_viewer_permissions = setup_permissions.GROUP_PERMISSIONS['Implementing Partner_viewer']

        self.assertTrue('can_view_purchase_order' in unicef_admin_permissions)
        self.assertTrue('can_view_purchase_order' in unicef_editor_permissions)
        self.assertTrue('can_view_purchase_order' in unicef_viewer_permissions)
        self.assertTrue('can_view_purchase_order' not in ip_editor_permissions)
        self.assertTrue('can_view_purchase_order' not in ip_viewer_permissions)
