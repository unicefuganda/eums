from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from eums.auth import create_groups, create_permissions

GROUP_PERMISSIONS = {
    'UNICEF_admin': [
        'can_view_users',
        'can_view_dashboard',
        'can_view_distribution_plans',
        'can_view_delivery_reports',
        'can_view_reports',
        'can_view_contacts',
        'can_view_consignees',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        'can_import_data',
        'add_user',
        'change_user',
        'add_distributionplan',
        'change_distributionplan',
        'can_track_deliveries',
        'can_view_unicef_menu'
    ],
    'UNICEF_editor': [
        'can_view_dashboard',
        'can_view_consignees',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        'add_distributionplan',
        'change_distributionplan',
        'can_view_distribution_plans',
        'can_track_deliveries',
        'can_view_unicef_menu',
        'can_view_reports',
    ],
    'UNICEF_viewer': [
        'can_view_dashboard',
        'can_view_consignees',
        'can_view_distribution_plans',
        'can_view_unicef_menu'
    ],
    'Implementing Partner_editor': [
        'can_view_delivery_reports',
        'can_view_dashboard',
        'can_view_consignees',
        'add_consignee',
        'change_consignee',
        'delete_consignee',
        'can_view_distribution_plans',
        'add_distributionplan'
    ],
    'Implementing Partner_viewer': [
        'can_view_dashboard',
        'can_view_consignees',
        'can_view_distribution_plans'
    ]
}


class Command(BaseCommand):
    help = 'Associates Auth_Groups with permissions'

    def handle(self, *args, **options):
        create_groups()
        create_permissions()

        for group_name, codenames in GROUP_PERMISSIONS.iteritems():
            group = Group.objects.get(name=group_name)
            group_permissions = []
            for codename in codenames:
                group_permissions.append(Permission.objects.get(codename=codename))

            group.permissions = group_permissions
            group.save()
