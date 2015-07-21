from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission


class Command(BaseCommand):
    help = 'Associates Auth_Groups with permissions'

    def handle(self, *args, **options):
        unicef_admin = Group.objects.get(name='UNICEF_admin')
        unicef_viewer = Group.objects.get(name='UNICEF_viewer')

        can_view_consignees = Permission.objects.get(codename="can_view_consignees")
        add_consignee = Permission.objects.get(codename="add_consignee")
        change_consignee = Permission.objects.get(codename="change_consignee")
        delete_consignee = Permission.objects.get(codename="delete_consignee")

        unicef_admin_perms = []
        unicef_admin_perms.append(can_view_consignees)
        unicef_admin_perms.append(add_consignee)
        unicef_admin_perms.append(change_consignee)
        unicef_admin_perms.append(delete_consignee)

        unicef_admin.permissions.add(*unicef_admin_perms)
        unicef_admin.save()

        unicef_viewer_perms = []
        unicef_viewer_perms.append(can_view_consignees)

        unicef_viewer.permissions.add(*unicef_viewer_perms)
        unicef_viewer.save()