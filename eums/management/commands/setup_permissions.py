import logging

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from eums.auth import create_groups, create_permissions, GROUP_UNICEF_ADMIN, GROUP_UNICEF_EDITOR, GROUP_UNICEF_VIEWER, \
    GROUP_IP_EDITOR, GROUP_IP_VIEWER, PermissionCode

logger = logging.getLogger(__name__)

GROUP_PERMISSIONS = {
    GROUP_UNICEF_ADMIN: [
        PermissionCode.CAN_VIEW_DASH_BOARD,

        PermissionCode.CAN_VIEW_USER,
        PermissionCode.CAN_ADD_USER,
        PermissionCode.CAN_CHANGE_USER,

        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN,
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN,

        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN_NODE,

        PermissionCode.CAN_VIEW_SELF_CONTACTS,
        PermissionCode.CAN_VIEW_CONTACTS,
        PermissionCode.CAN_CREATE_CONTACTS,
        PermissionCode.CAN_EDIT_CONTACTS,

        PermissionCode.CAN_VIEW_CONSIGNEE,
        PermissionCode.CAN_ADD_CONSIGNEE,
        PermissionCode.CAN_CHANGE_CONSIGNEE,
        PermissionCode.CAN_DELETE_CONSIGNEE,

        'can_import_data',
        'can_view_unicef_menu',

        PermissionCode.CAN_VIEW_PURCHASE_ORDER,
        PermissionCode.CAN_PATCH_PURCHASE_ORDER,
        PermissionCode.CAN_VIEW_RELEASE_ORDER,

        PermissionCode.CAN_VIEW_ALERT,
        PermissionCode.CAN_PATCH_ALERT,

        PermissionCode.CAN_VIEW_SYSTEM_SETTINGS,
        PermissionCode.CAN_CHANGE_SYSTEM_SETTINGS,

        PermissionCode.CAN_VIEW_STOCK_REPORT,
        PermissionCode.CAN_VIEW_ITEM_FEEDBACK_REPORT,
        PermissionCode.CAN_VIEW_SUPPLY_EFFICIENCY_REPORT,
        PermissionCode.CAN_VIEW_DELIVERY_FEEDBACK_REPORT,
    ],
    GROUP_UNICEF_EDITOR: [
        PermissionCode.CAN_VIEW_DASH_BOARD,

        PermissionCode.CAN_VIEW_CONSIGNEE,
        PermissionCode.CAN_ADD_CONSIGNEE,
        PermissionCode.CAN_CHANGE_CONSIGNEE,
        PermissionCode.CAN_DELETE_CONSIGNEE,

        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN_NODE,

        'can_view_unicef_menu',
        PermissionCode.CAN_VIEW_SELF_CONTACTS,
        PermissionCode.CAN_CREATE_CONTACTS,
        PermissionCode.CAN_EDIT_CONTACTS,

        PermissionCode.CAN_VIEW_PURCHASE_ORDER,
        PermissionCode.CAN_PATCH_PURCHASE_ORDER,
        PermissionCode.CAN_VIEW_RELEASE_ORDER,

        PermissionCode.CAN_VIEW_ALERT,
        PermissionCode.CAN_PATCH_ALERT,
        PermissionCode.CAN_VIEW_SYSTEM_SETTINGS,

        PermissionCode.CAN_VIEW_STOCK_REPORT,
        PermissionCode.CAN_VIEW_ITEM_FEEDBACK_REPORT,
        PermissionCode.CAN_VIEW_SUPPLY_EFFICIENCY_REPORT,
        PermissionCode.CAN_VIEW_DELIVERY_FEEDBACK_REPORT,
    ],
    GROUP_UNICEF_VIEWER: [
        PermissionCode.CAN_VIEW_DASH_BOARD,
        'can_view_unicef_menu',
        PermissionCode.CAN_VIEW_CONSIGNEE,

        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN,

        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN_NODE,

        PermissionCode.CAN_VIEW_SELF_CONTACTS,
        PermissionCode.CAN_CREATE_CONTACTS,
        PermissionCode.CAN_EDIT_CONTACTS,

        PermissionCode.CAN_VIEW_PURCHASE_ORDER,
        PermissionCode.CAN_PATCH_PURCHASE_ORDER,
        PermissionCode.CAN_VIEW_RELEASE_ORDER,

        PermissionCode.CAN_VIEW_ALERT,
        PermissionCode.CAN_VIEW_SYSTEM_SETTINGS,

        PermissionCode.CAN_VIEW_STOCK_REPORT,
        PermissionCode.CAN_VIEW_ITEM_FEEDBACK_REPORT,
        PermissionCode.CAN_VIEW_SUPPLY_EFFICIENCY_REPORT,
        PermissionCode.CAN_VIEW_DELIVERY_FEEDBACK_REPORT,
    ],
    GROUP_IP_EDITOR: [
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLANS,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_ADD_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_CHANGE_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_VIEW_DASH_BOARD,

        PermissionCode.CAN_VIEW_CONSIGNEE,
        PermissionCode.CAN_ADD_CONSIGNEE,
        PermissionCode.CAN_CHANGE_CONSIGNEE,
        PermissionCode.CAN_DELETE_CONSIGNEE,

        PermissionCode.CAN_VIEW_SELF_CONTACTS,
        PermissionCode.CAN_CREATE_CONTACTS,
        PermissionCode.CAN_EDIT_CONTACTS,

        'change_upload',
        'delete_upload',
        'add_upload',

        PermissionCode.CAN_VIEW_CONSIGNEE_ITEM,
        PermissionCode.CAN_VIEW_SYSTEM_SETTINGS,

        PermissionCode.CAN_VIEW_STOCK_REPORT,
    ],
    GROUP_IP_VIEWER: [
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLAN_NODE,
        PermissionCode.CAN_VIEW_DISTRIBUTION_PLANS,
        PermissionCode.CAN_VIEW_DASH_BOARD,
        PermissionCode.CAN_VIEW_CONSIGNEE,

        PermissionCode.CAN_VIEW_SELF_CONTACTS,
        PermissionCode.CAN_CREATE_CONTACTS,
        PermissionCode.CAN_EDIT_CONTACTS,

        PermissionCode.CAN_VIEW_CONSIGNEE_ITEM,
        PermissionCode.CAN_VIEW_SYSTEM_SETTINGS,

        PermissionCode.CAN_VIEW_STOCK_REPORT,
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
