# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def resave_deliveries_with_ips(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    for delivery in Delivery.objects.using(db_alias).all():
        delivery_root_nodes = DeliveryNode.objects.using(db_alias).filter(distribution_plan=delivery)
        root_node = delivery_root_nodes.first()
        if root_node:
            delivery.ip = root_node.ip
            delivery.save()


def reset_deliveries_ips_to_none(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    db_alias = schema_editor.connection.alias
    Delivery.objects.using(db_alias).all().update(ip=None)


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0041_auto_20151102_1827'),
    ]

    operations = [
        migrations.RunPython(resave_deliveries_with_ips, reset_deliveries_ips_to_none)
    ]
