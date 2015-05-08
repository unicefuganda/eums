# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0030_auto_20150506_1141'),
    ]

    operations = [
        migrations.RenameField(
            model_name='multiplechoiceanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.RenameField(
            model_name='noderun',
            old_name='node_line_item',
            new_name='node',
        ),
        migrations.RenameField(
            model_name='numericanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.RenameField(
            model_name='runqueue',
            old_name='node_line_item',
            new_name='node',
        ),
        migrations.RenameField(
            model_name='textanswer',
            old_name='line_item_run',
            new_name='node_run',
        ),
        migrations.AlterField(
            model_name='distributionplannode',
            name='item',
            field=models.ForeignKey(to='eums.SalesOrderItem'),
        ),
    ]
