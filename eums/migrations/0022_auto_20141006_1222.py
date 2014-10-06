# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0021_noderun_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='noderun',
            name='node',
        ),
        migrations.AddField(
            model_name='noderun',
            name='node_line_item',
            field=models.ForeignKey(default=1, to='eums.DistributionPlanLineItem'),
            preserve_default=False,
        ),
    ]
