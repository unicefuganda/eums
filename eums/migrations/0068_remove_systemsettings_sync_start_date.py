# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0067_auto_20151217_1030'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='systemsettings',
            name='sync_start_date',
        ),
    ]
