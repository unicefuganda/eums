# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.auth.models import Group

def update_auth_groups(apps, schema_editor):
    """Forward data migration that updates UNICEF and Implementing Partner groups and creates missing groups

    """
    unicef_group = Group.objects.get(name='UNICEF')
    unicef_group.name = 'UNICEF_admin'
    unicef_group.save()

    Group.objects.create(name='UNICEF_editor')
    Group.objects.create(name='UNICEF_viewer')

    implementing_partner_group = Group.objects.get(name='Implementing Partner')
    implementing_partner_group.name = 'Implementing Partner_editor'
    implementing_partner_group.save()

    Group.objects.create(name='Implementing Partner_viewer')

def reverse_auth_groups(apps, schema_editor):
    """Backward data migration that removes new groups and returns the edited groups to former names

    """
    unicef_group = Group.objects.get(name='UNICEF_admin')
    unicef_group.name = 'UNICEF'
    unicef_group.save()

    Group.objects.get(name='UNICEF_editor').delete()
    Group.objects.get(name='UNICEF_viewer').delete()

    implementing_partner_group = Group.objects.get(name='Implementing Partner_editor')
    implementing_partner_group.name = 'Implementing Partner'
    implementing_partner_group.save()

    Group.objects.get(name='Implementing Partner_viewer').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0038_auto_20150709_1222'),
        ]

    operations = [
        migrations.RunPython(update_auth_groups, reverse_auth_groups)
    ]
