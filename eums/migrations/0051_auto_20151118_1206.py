# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0050_auto_20151117_0535'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='runnable',
            name='time_limitation_on_distribution',
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='time_limitation_on_distribution',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
    ]
