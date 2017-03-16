# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0012_auto_20160327_2110'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemsettings',
            name='sync_end_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
