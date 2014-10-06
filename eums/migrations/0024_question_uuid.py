# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0023_auto_20141003_1651'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='uuid',
            field=models.CharField(default='-x-x-x-x-x', unique=True, max_length=50),
            preserve_default=False,
        ),
    ]
