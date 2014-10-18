# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0013_auto_20141018_1125'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distributionreport',
            old_name='total_distributed_with_quality_issues',
            new_name='total_distributed',
        ),
        migrations.RenameField(
            model_name='distributionreport',
            old_name='total_distributed_with_quantity_issues',
            new_name='total_received',
        ),
        migrations.RemoveField(
            model_name='distributionreport',
            name='total_distributed_without_issues',
        ),
        migrations.RemoveField(
            model_name='distributionreport',
            name='total_not_distributed',
        ),
        migrations.RemoveField(
            model_name='distributionreport',
            name='total_received_with_quality_issues',
        ),
        migrations.RemoveField(
            model_name='distributionreport',
            name='total_received_with_quantity_issues',
        ),
        migrations.RemoveField(
            model_name='distributionreport',
            name='total_received_without_issues',
        ),
    ]
