# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from eums.models import DistributionPlanNode, SalesOrderItem


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0029_auto_20150414_1137'),
        ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='planned_distribution_date',
            field=models.DateField(default=datetime.date(2015, 5, 6)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='remark',
            field=models.TextField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='targeted_quantity',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='track',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='item',
            field=models.ForeignKey(SalesOrderItem, null=True),
        ),
        ]