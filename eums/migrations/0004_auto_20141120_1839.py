# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models, migrations
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

def create_user_group(apps, schema_editor):
    """Forward data migration that create the UNICEF and Implementing Partner groups as well as permission

    """
    unicef_group = Group.objects.create(name='UNICEF')
    auth_content = ContentType.objects.get_for_model(Permission)

    if auth_content:
        unicef_group_perm, out = Permission.objects.get_or_create(name='Can view users', codename='can_view_users', content_type=auth_content)
        unicef_group.permissions.add(unicef_group_perm)
        unicef_group.save()

    Group.objects.create(name='Implementing Partner')

def remove_user_groups(apps, schema_editor):
    """Backward data migration that remove the UNICEF and Implementing Partner groups as well as permission

    """
    Group.objects.get(name='UNICEF').delete()
    Group.objects.get(name='Implementing Partner').delete()
    Permission.objects.get(codename='can_view_users').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_auto_20141112_1926'),
    ]

    operations = [
        migrations.RunPython(create_user_group, remove_user_groups)
    ]
