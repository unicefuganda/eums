# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from eums.models import DistributionPlanNode, SalesOrderItem


def migrate_distribution_plan_item_data(app,  schema_editor):
    for node in DistributionPlanNode.objects.all():
        line_item = node.distributionplanlineitem_set.all().first()
        if line_item is None:
            continue
        node.item = line_item.item
        node.targeted_quantity = line_item.targeted_quantity
        node.track = line_item.track
        node.planned_distribution_date = line_item.planned_distribution_date
        node.remark = line_item.remark
        node.save()


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0030_auto_20150506_1141'),
        ]

    operations = [
        migrations.RunPython(migrate_distribution_plan_item_data)
    ]
