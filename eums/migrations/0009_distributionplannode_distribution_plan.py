# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0008_distributionplanlineitem_distribution_plan_node'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='distribution_plan',
            field=models.ForeignKey(default=1, to='eums.DistributionPlan'),
            preserve_default=False,
        ),
    ]
