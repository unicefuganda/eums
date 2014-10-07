# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0033_auto_20141007_1147'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='runqueue',
            name='start_run_date',
        ),
        migrations.AddField(
            model_name='runqueue',
            name='run_delay',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=1),
            preserve_default=False,
        ),
    ]
