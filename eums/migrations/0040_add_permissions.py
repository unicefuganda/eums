# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


perm_codenames = [
    {'name': 'Can view deliveries', 'codename': 'can_view_deliveries'},
    {'name': 'Can create deliveries', 'codename': 'can_create_deliveries'},
    {'name': 'Can track deliveries', 'codename': 'can_track_deliveries'},

    {'name': 'Can view delivery reports', 'codename': 'can_view_delivery_reports'},
    {'name': 'Can create delivery reports', 'codename': 'can_create_delivery_reports'},
    {'name': 'Can acknowledge deliveries', 'codename': 'can_acknowledge_deliveries'},

    {'name': 'Can view field verification reports', 'codename': 'can_view_field_verification_reports'},
    {'name': 'Can create field verification reports', 'codename': 'can_create_field_verification_reports'},

    {'name': 'Can view IP stock reports', 'codename': 'can_view_ip_stock_reports'},
    {'name': 'Can view End User feedback reports', 'codename': 'can_view_end_user_feedback_reports'},
    {'name': 'Can view Sub Consignee feedback reports', 'codename': 'can_view_cub_consignee_feedback_reports'},
    {'name': 'Can view IP feedback reports', 'codename': 'can_view_ip_feedback_reports'},

    {'name': 'Can view consignees', 'codename': 'can_view_consignees'},
    {'name': 'Can import data', 'codename': 'can_import_data'},

    {'name': 'Can create contacts', 'codename': 'can_create_contacts'},
    {'name': 'Can edit contacts', 'codename': 'can_edit_contacts'},
    {'name': 'Can push contacts to RapidPro', 'codename': 'can_push_contacts_to_rapid_pro'},
]

def create_user_permissions(apps, schema_editor):
    """Forward data migration that creates permissions

    """
    auth_content = ContentType.objects.get_for_model(Permission)

    if auth_content:
        for perm in perm_codenames:
            created_perm, out = Permission.objects.get_or_create(name=perm['name'], codename=perm['codename'], content_type=auth_content)

def remove_user_permissions(apps, schema_editor):
    """Backward data migration that remove permissions

    """
    for perm in perm_codenames:
        try:
            Permission.objects.get(codename=perm['codename']).delete()
        except:
            pass

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0039_add_new_auth_groups'),
        ]

    operations = [
        migrations.RunPython(create_user_permissions, remove_user_permissions)
    ]