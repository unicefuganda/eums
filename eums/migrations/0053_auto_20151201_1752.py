# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0052_runnable_tracked_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='runnable',
            name='tracked_date',
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='tracked_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
