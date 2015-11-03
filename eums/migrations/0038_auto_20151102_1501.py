# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.db.models import Q


def transfer_total_value_to_runnable_value(apps, schema_editor):
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    all_nodes = DeliveryNode.objects.using(db_alias).all()
    for node in all_nodes:
        node.runnable_value = node.total_value
        node.save()


def transfer_runnable_value_to_total_value(apps, schema_editor):
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    all_nodes = DeliveryNode.objects.using(db_alias).filter(Q(total_value=None) | Q(total_value=0))
    for node in all_nodes:
            node.total_value = node.runnable_value
            node.save()


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0037_runnable_runnable_value'),
    ]

    operations = [
        migrations.RunPython(transfer_total_value_to_runnable_value, transfer_runnable_value_to_total_value)
    ]
