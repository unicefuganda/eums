# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_migrate_data_from_lineitem_to_node'),
    ]

    operations = [
        migrations.RenameField(
            model_name='multiplechoiceanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.RenameField(
            model_name='numericanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.RenameField(
            model_name='textanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.RemoveField(
            model_name='nodelineitemrun',
            name='node_line_item',
        ),
        migrations.RemoveField(
            model_name='runqueue',
            name='node_line_item',
        ),
        migrations.AddField(
            model_name='nodelineitemrun',
            name='node',
            field=models.ForeignKey(default=None, to='eums.DistributionPlanNode'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='runqueue',
            name='node',
            field=models.ForeignKey(default=None, to='eums.DistributionPlanNode'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='distributionplannode',
            name='item',
            field=models.ForeignKey(to='eums.SalesOrderItem'),
        ),
    ]
