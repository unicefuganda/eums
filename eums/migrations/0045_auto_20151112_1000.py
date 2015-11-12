# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0044_auto_20151105_1203'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplan',
            name='days_needed_for_distribution',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='distribution_required',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
