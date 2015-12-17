# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0065_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemsettings',
            name='sync_start_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
