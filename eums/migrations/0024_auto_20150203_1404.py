# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

implementing_partner_perms_codenames = [
    {'name': 'Can view dashboard', 'codename': 'can_view_dashboard'},
]

def create_ip_permissions(apps, schema_editor):
    """Forward data migration that create the Implementing Partner groups permissions

    """
    implementing_partner_group = Group.objects.get(name='Implementing Partner')
    auth_content = ContentType.objects.get_for_model(Permission)

    if auth_content:
        implementing_partner_perms = []
        for perm in implementing_partner_perms_codenames:
            implementing_partner_perm, out = Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'], content_type=auth_content)
            implementing_partner_perms.append(implementing_partner_perm)
        implementing_partner_group.permissions.add(*implementing_partner_perms)
        implementing_partner_group.save()

def remove_ip_permissions(apps, schema_editor):
    """Backward data migration that removes the Implementing Partner groups permissions

    """
    implementing_partner_group = Group.objects.get(name='Implementing Partner')

    for perm in implementing_partner_perms_codenames:
         try:
            permission = Permission.objects.get(name=perm['name'], codename=perm['codename'])
            implementing_partner_group.permissions.remove(permission)
            implementing_partner_group.save()
         except:
            pass

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0023_auto_20141208_1908'),
    ]

    operations = [
        migrations.RunPython(create_ip_permissions, remove_ip_permissions)
    ]