# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

from eums.auth import create_permissions, teardown_permissions


def create_user_permissions(apps, schema_editor):
    """Forward data migration that creates permissions
    """
    create_permissions()


def remove_user_permissions(apps, schema_editor):
    """Backward data migration that remove permissions
    """
    teardown_permissions()


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0039_add_new_auth_groups'),
    ]

    operations = [
        migrations.RunPython(create_user_permissions, remove_user_permissions)
    ]
