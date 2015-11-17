# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0046_auto_20151113_1048'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='time_limitation_on_distribution',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
    ]
