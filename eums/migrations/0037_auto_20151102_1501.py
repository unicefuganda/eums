# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def transfer_total_value_to_runnable_value(apps, schema_editor):
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    all_nodes = DeliveryNode.objects.all()
    for node in all_nodes:
        node.runnable_value = node.total_value
        node.save()


def transfer_runnable_value_to_total_value(apps, schema_editor):
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    all_nodes = DeliveryNode.objects.all()
    for node in all_nodes:
        if not node.total_value:
            node.total_value = node.runnable_value
            node.save()


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0036_runnable_runnable_value'),
    ]

    operations = [
        migrations.RunPython(transfer_total_value_to_runnable_value, transfer_runnable_value_to_total_value)
    ]
