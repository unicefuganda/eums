# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0055_auto_20151203_0429'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplan',
            name='tracked_date',
            field=models.DateTimeField(null=True),
        ),
    ]
