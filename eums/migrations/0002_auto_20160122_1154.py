# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='systemsettings',
            name='sync_start_date',
            field=models.DateField(null=True),
        ),
    ]
