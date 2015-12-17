# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0066_systemsettings_sync_start_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='systemsettings',
            name='sync_start_date',
            field=models.DateTimeField(null=True),
        ),
    ]
