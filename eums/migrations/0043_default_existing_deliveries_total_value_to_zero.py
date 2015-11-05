# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def default_deliveries_total_values_to_zero(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    Delivery.objects.using(db_alias).filter(total_value=None).update(total_value=0)
    DeliveryNode.objects.using(db_alias).filter(total_value=None).update(total_value=0)


def reset_deliveries_total_values_to_none(apps, schema_editor):
    Delivery = apps.get_model("eums", "DistributionPlan")
    DeliveryNode = apps.get_model("eums", "DistributionPlanNode")
    db_alias = schema_editor.connection.alias
    Delivery.objects.using(db_alias).filter(total_value=0).update(total_value=None)
    DeliveryNode.objects.using(db_alias).filter(total_value=0).update(total_value=None)


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0042_re_assigning_ips_to_deliveries'),
    ]

    operations = [
        migrations.RunPython(default_deliveries_total_values_to_zero, reset_deliveries_total_values_to_none)
    ]
