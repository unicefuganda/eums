# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0011_auto_20150820_1325'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplan',
            name='confirmed',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
