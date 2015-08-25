# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0014_distributionplannode_balance'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplannode',
            name='distribution_plan',
            field=models.ForeignKey(blank=True, to='eums.DistributionPlan', null=True),
        ),
    ]
