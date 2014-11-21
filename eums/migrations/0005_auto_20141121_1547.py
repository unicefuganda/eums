# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

unicef_perms_codenames = [
    {'name': 'Can view dashboard', 'codename': 'can_view_dashboard'},
    {'name': 'Can view distribution plans', 'codename': 'can_view_distribution_plans'},
    {'name': 'Can view delivery reports', 'codename': 'can_view_delivery_reports'},
    {'name': 'Can view reports', 'codename': 'can_view_reports'},
    {'name': 'Can view contacts', 'codename': 'can_view_contacts'}
]

implementing_partner_perms_codenames = [
    {'name': 'Can view delivery reports', 'codename': 'can_view_delivery_reports'}
]

def create_user_permissions(apps, schema_editor):
    """Forward data migration that create the UNICEF and Implementing Partner groups permissions

    """
    unicef_group = Group.objects.get(name='UNICEF')
    implementing_partner_group = Group.objects.get(name='Implementing Partner')
    auth_content = ContentType.objects.get_for_model(Permission)

    if auth_content:
        unicef_group_perms = []
        for perm in unicef_perms_codenames:
            unicef_group_perm, out = Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'], content_type=auth_content)
            unicef_group_perms.append(unicef_group_perm)
        unicef_group.permissions.add(*unicef_group_perms)
        unicef_group.save()

        implementing_partner_perms = []
        for perm in implementing_partner_perms_codenames:
            implementing_partner_perm, out = Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'], content_type=auth_content)
            implementing_partner_perms.append(implementing_partner_perm)
        implementing_partner_group.permissions.add(*implementing_partner_perms)
        implementing_partner_group.save()

def remove_user_permissions(apps, schema_editor):
    """Backward data migration that remove the UNICEF and Implementing Partner groups permissions

    """
    for perm in unicef_perms_codenames:
        try:
            Permission.objects.get(codename=perm['codename']).delete()
        except:
            pass

    for perm in implementing_partner_perms_codenames:
         try:
            Permission.objects.get(codename=perm['codename']).delete()
         except:
            pass

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0004_auto_20141120_1839'),
    ]

    operations = [
        migrations.RunPython(create_user_permissions, remove_user_permissions)
    ]
