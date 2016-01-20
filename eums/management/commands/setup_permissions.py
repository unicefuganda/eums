import logging

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from eums.auth import create_groups, create_permissions, GROUP_UNICEF_ADMIN, GROUP_UNICEF_EDITOR, GROUP_UNICEF_VIEWER, \
    GROUP_IP_EDITOR, GROUP_IP_VIEWER, PermissionCode

logger = logging.getLogger(__name__)
GROUP_PERMISSIONS = {
    GROUP_UNICEF_ADMIN: [
        PermissionCode.CAN_VIEW_USER,
        PermissionCode.CAN_ADD_USER,
        'can_view_dashboard',
        'can_view_distribution_plans',
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        'change_distributionplan',
        'can_view_delivery_reports',
        'can_view_reports',
        'can_view_self_contacts',
        'can_view_contacts',
        'can_create_contacts',
        'can_edit_contacts',
        'can_view_consignees',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        'can_import_data',
        'add_user',
        'change_user',
        'can_track_deliveries',
        'can_view_unicef_menu',
        'can_view_purchase_order',
        'can_view_release_order',
    ],
    GROUP_UNICEF_EDITOR: [
        'can_view_dashboard',
        'can_view_consignees',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        'change_distributionplan',
        'can_view_distribution_plans',
        'can_track_deliveries',
        'can_view_unicef_menu',
        'can_view_reports',
        'can_view_self_contacts',
        'can_create_contacts',
        'can_edit_contacts',
        'can_view_purchase_order',
        'can_view_release_order',
    ],
    GROUP_UNICEF_VIEWER: [
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        'can_view_dashboard',
        'can_view_consignees',
        'can_view_distribution_plans',
        'can_view_unicef_menu',
        'can_view_self_contacts',
        'can_create_contacts',
        'can_edit_contacts',
        'can_view_purchase_order',
        'can_view_release_order',
    ],
    GROUP_IP_EDITOR: [
        'can_view_delivery_reports',
        'can_view_dashboard',
        'can_view_consignees',
        'can_view_reports',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        'can_view_distribution_plans',
        'change_distributionplan',
        'can_view_self_contacts',
        'can_create_contacts',
        'can_edit_contacts',
        'change_upload',
        'delete_upload',
        'add_upload',
    ],
    GROUP_IP_VIEWER: [
        'can_view_dashboard',
        'can_view_consignees',
        'can_view_reports',
        'can_view_distribution_plans',
        'can_view_self_contacts',
        'can_create_contacts',
        'can_edit_contacts',
    ]
}


class Command(BaseCommand):
    help = 'Associates Auth_Groups with permissions'

    def handle(self, *args, **options):
        create_groups()
        create_permissions()

        for group_name, code_names in GROUP_PERMISSIONS.iteritems():
            group = Group.objects.get(name=group_name)
            group_permissions = []
            for codename in code_names:
                group_permissions.append(Permission.objects.get(codename=codename))

            group.permissions = group_permissions
            group.save()
