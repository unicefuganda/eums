# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations
from eums.auth import create_groups, teardown_groups


def update_auth_groups(apps, schema_editor):
    """Forward data migration that updates UNICEF and Implementing Partner groups and creates missing groups
    """
    create_groups()


def reverse_auth_groups(apps, schema_editor):
    """Backward data migration that removes new groups and returns the edited groups to former names
    """
    teardown_groups()


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0038_auto_20150709_1222'),
    ]

    operations = [
        migrations.RunPython(update_auth_groups, reverse_auth_groups)
    ]
