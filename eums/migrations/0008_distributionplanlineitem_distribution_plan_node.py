# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0007_auto_20140917_1739'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='distribution_plan_node',
            field=models.ForeignKey(default=1, to='eums.DistributionPlanNode'),
            preserve_default=False,
        ),
    ]
