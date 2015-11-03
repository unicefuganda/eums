# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
# from eums.models import DistributionPlan as Delivery


def resave_root_nodes(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    for delivery in Delivery.objects.using(db_alias).all():
        delivery_root_nodes = DeliveryNode.objects.using(db_alias).filter(distribution_plan=delivery)
        delivery.total_value = reduce(lambda total, node: total + (node.total_value or 0), delivery_root_nodes, 0)
        delivery.save()


def reset_deliveries_total_value_to_zero(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    db_alias = schema_editor.connection.alias
    Delivery.objects.using(db_alias).all().update(total_value=None)


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0039_auto_20151102_1556'),
    ]

    operations = [
        migrations.RunPython(resave_root_nodes, reset_deliveries_total_value_to_zero)
    ]
